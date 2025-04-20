"""
backend/app/routers/abstract_syntax_tree
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
"""

import ast
import inspect
import json
import os
import re
import tracemalloc
import uuid
from _ast import AST

import pydot
from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

# Memory limit for AST visualization generation
MEMORY_LIMIT_MB = int(os.getenv("MEMORY_LIMIT_MB", 10))  # Default to 10MB

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


def check_function_memory(func, *args, limit_mb=100, **kwargs):
    """Run a function and check its memory usage."""
    tracemalloc.start()

    # Measure memory before running the function
    snapshot_before = tracemalloc.take_snapshot()

    try:
        result = func(*args, **kwargs)  # Run the function
    finally:
        # Measure memory after running the function
        snapshot_after = tracemalloc.take_snapshot()
        tracemalloc.stop()

    # Calculate the memory usage difference
    stats = snapshot_after.compare_to(snapshot_before, "lineno")
    total_memory_used = sum(stat.size for stat in stats) / (1024 * 1024)  # Convert to MB

    if total_memory_used > limit_mb:
        raise MemoryError(
            f"Function memory usage exceeded limit of {limit_mb}MB "
            f"(current: {total_memory_used:.2f}MB)"
        )

    return result


@router.get("/ast/visualize")
async def visualize_ast(input_code: str = Query(..., max_length=1000)):
    """Generate an AST visualization for the provided Python code."""

    def generate_ast_visualization():
        # Parse and generate AST visualization
        graph = pydot.Dot(graph_type="digraph", strict=True, concentrate=True, splines="polyline")
        parsed_ast = json_ast(input_code)
        grapher(graph, parsed_ast)

        output_filename = f"ast_{uuid.uuid4().hex}.png"
        output_file_path = os.path.join(FULL_AST_DIR, output_filename)
        graph.write_png(output_file_path)

        if not os.path.exists(output_file_path):
            raise HTTPException(status_code=500, detail="Failed to generate AST image.")

        return output_filename

    try:
        # Check current function memory usage - prevent DoS attacks by limiting memory usage to 10MB
        output_filename = check_function_memory(
            generate_ast_visualization, limit_mb=MEMORY_LIMIT_MB
        )

        # Return the AST visualization file path
        return {
            "input_code": input_code,
            "file_path": f"static/images/ast_storage/{output_filename}",
            "message": "AST image successfully generated.",
        }

    except MemoryError as e:
        raise HTTPException(status_code=413, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating AST: {str(e)}")
