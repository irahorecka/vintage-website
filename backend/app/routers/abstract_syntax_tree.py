"""
backend/app/routers/abstract_syntax_tree
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
"""

import ast
import inspect
import json
import os
import re
import time
import uuid
from collections import defaultdict
from _ast import AST

import pydot
from fastapi import APIRouter, HTTPException, Query, Request

router = APIRouter()

MAX_AST_DEPTH = 50
MAX_AST_NODES = 500
RATE_LIMIT_REQUESTS = 20
RATE_LIMIT_WINDOW = 60  # seconds
PNG_MAX_AGE_HOURS = 1

_rate_limit_store: dict[str, list[float]] = defaultdict(list)

# Directory to save downloaded AST images
BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # Current file's directory
FULL_AST_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "static", "images", "ast_storage"))
# Ensure the directory exists
os.makedirs(FULL_AST_DIR, exist_ok=True)

# ~~~~~~~~~~~~~~~~~~ PARSING AST OBJ TO JSON ~~~~~~~~~~~~~~~~~~


def ast_parse(method):
    """Decorator to parse user input to JSON-AST object."""

    def wrapper(*args, **kwargs):
        try:
            if isinstance(args[0], str):
                if len(args[0]) > 1000:
                    raise ValueError("Input code is too large.")
                ast_obj = ast.parse(args[0])  # Parse string input into an AST object
            else:
                obj = inspect.getsource(args[0])  # Get source code of a method
                ast_obj = ast.parse(obj)  # Parse the source code into an AST object
            validate_ast(ast_obj)
            json_parsed = method(ast_obj, **kwargs)  # Convert AST object to JSON
            return json.loads(json_parsed)  # Parse JSON string into Python dict
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing AST: {str(e)}")

    return wrapper


@ast_parse
def json_ast(node):
    """Parse an AST object into JSON."""

    def _format(_node):
        if isinstance(_node, AST):
            # Format AST fields as a dictionary
            fields = [("_PyType", _format(_node.__class__.__name__))] + [
                (a, _format(b)) for a, b in iter_fields(_node)
            ]
            return "{ %s }" % ", ".join(f'"{k}": {v}' for k, v in fields)
        if isinstance(_node, list):
            # Format a list of nodes
            return f"[ {', '.join(_format(x) for x in _node)} ]"
        if isinstance(_node, bytes):
            # Decode bytes to string
            return json.dumps(_node.decode("utf-8"))
        return json.dumps(_node)  # Default case for primitives

    return _format(node)


def iter_fields(node):
    """Get attributes of a node."""
    if hasattr(node, "_fields"):
        for field in node._fields:
            yield field, getattr(node, field)  # Yield field name and its value


# ~~~~~~~~~~~~~~~~~~~~ SECURITY HELPERS ~~~~~~~~~~~~~~~~~~~~~~


def validate_ast(tree):
    """Reject pathological AST structures before recursive processing."""
    node_count = 0

    def walk(node, depth):
        nonlocal node_count
        if depth > MAX_AST_DEPTH:
            raise ValueError(f"Expression nesting exceeds limit ({MAX_AST_DEPTH})")
        node_count += 1
        if node_count > MAX_AST_NODES:
            raise ValueError(f"Expression complexity exceeds limit ({MAX_AST_NODES} nodes)")
        for child in ast.iter_child_nodes(node):
            walk(child, depth + 1)

    walk(tree, 0)


def check_rate_limit(client_ip: str):
    """Sliding-window rate limiter; raises 429 when the client exceeds the limit."""
    now = time.time()
    window_start = now - RATE_LIMIT_WINDOW
    timestamps = _rate_limit_store[client_ip]
    _rate_limit_store[client_ip] = [t for t in timestamps if t > window_start]
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")
    _rate_limit_store[client_ip].append(now)


def cleanup_old_pngs():
    """Delete generated PNG files older than PNG_MAX_AGE_HOURS."""
    cutoff = time.time() - PNG_MAX_AGE_HOURS * 3600
    with os.scandir(FULL_AST_DIR) as entries:
        for entry in entries:
            if entry.name.startswith("ast_") and entry.name.endswith(".png"):
                if entry.stat().st_mtime < cutoff:
                    os.unlink(entry.path)


# ~~~~~~~~~~~~~~~~~~~~~~~~ DRAWING AST ~~~~~~~~~~~~~~~~~~~~~~~~~


def grapher(graph, ast_nodes, parent_node="", node_hash="__init__"):
    """Recursively parse JSON-AST object into a tree."""
    if isinstance(ast_nodes, dict):
        for key, node in ast_nodes.items():
            if not parent_node:
                parent_node = node  # Assign the first node as the parent
                continue
            if key == "_PyType":
                node = graph_detail(node, ast_nodes)  # Get detailed node info
                node_hash = draw(parent_node, node, graph=graph, parent_hash=node_hash)
                parent_node = node  # Update parent node
                continue
            if isinstance(node, dict):
                grapher(
                    graph, node, parent_node=parent_node, node_hash=node_hash
                )  # Recursively parse child nodes
            if isinstance(node, list):
                for item in node:
                    grapher(
                        graph, item, parent_node=parent_node, node_hash=node_hash
                    )  # Handle lists of child nodes


def graph_detail(value, ast_scope):
    """Retrieve node details."""
    detail_keys = ("module", "n", "s", "id", "name", "attr", "arg")
    for key in detail_keys:
        if key in ast_scope:
            value = f"{value}\n{key}: {ast_scope[key]}"  # Append details to the node label
    return value


def clean_node(method):
    """Decorator to sanitize node names."""

    def wrapper(*args, **kwargs):
        parent_name, child_name = args[:2]
        # Sanitize child node name by removing illegal characters
        child_name = re.sub(r"[,\/]$", "*", child_name or "")
        if len(child_name) > 250:
            child_name = (
                child_name[:247] + "..."
            )  # Truncate content to 247 characters and add ellipsis
        return method(parent_name, child_name, *args[2:], **kwargs)

    return wrapper


@clean_node
def draw(parent_name, child_name, graph, parent_hash):
    """Draw parent and child nodes."""
    # Create a parent node with a unique hash
    parent_node = pydot.Node(parent_hash, label=parent_name, shape="box")
    # Generate a unique hash for the child node
    child_hash = str(uuid.uuid4())
    child_node = pydot.Node(child_hash, label=child_name, shape="box")

    # Add nodes and edge to the graph
    graph.add_node(parent_node)
    graph.add_node(child_node)
    graph.add_edge(pydot.Edge(parent_node, child_node))

    return child_hash  # Return the unique hash for the child node


@router.get("/ast/visualize")
async def visualize_ast(request: Request, input_code: str = Query(..., max_length=1000)):
    """Generate an AST visualization for the provided Python code."""
    check_rate_limit(request.client.host)
    cleanup_old_pngs()

    try:
        graph = pydot.Dot(graph_type="digraph", strict=True, concentrate=True, splines="polyline")
        parsed_ast = json_ast(input_code)
        grapher(graph, parsed_ast)

        output_filename = f"ast_{uuid.uuid4().hex}.png"
        output_file_path = os.path.join(FULL_AST_DIR, output_filename)
        graph.write_png(output_file_path)

        if not os.path.exists(output_file_path):
            raise HTTPException(status_code=500, detail="Failed to generate AST image.")

        return {
            "input_code": input_code,
            "file_path": f"static/images/ast_storage/{output_filename}",
            "message": "AST image successfully generated.",
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating AST: {str(e)}")
