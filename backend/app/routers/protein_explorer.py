"""
backend/app/routers/protein_explorer
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
"""

import logging
import re

import requests
from fastapi import APIRouter, HTTPException
from rcsbsearchapi.search import TextQuery

_PDB_ID_RE = re.compile(r"^[0-9][A-Za-z0-9]{3}$")

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/protein", response_model=dict)
async def search_pdb(keyword: str):
    keyword = keyword.strip()
    if _PDB_ID_RE.match(keyword):
        first_pdb_id = keyword.upper()
    else:
        try:
            found_pdbs = list(TextQuery(value=keyword)())
        except requests.RequestException as exc:
            logger.exception("RCSB search API unavailable for keyword %r", keyword)
            raise HTTPException(
                status_code=503, detail="RCSB search service unavailable. Please try again later.",
            ) from exc
        except Exception as exc:
            logger.exception("Unexpected error querying RCSB search for keyword %r", keyword)
            raise HTTPException(status_code=500, detail="Error during PDB search.") from exc

        if not found_pdbs:
            raise HTTPException(status_code=404, detail="No PDB entries found.")

        first_pdb_id = found_pdbs[0]

    try:
        metadata_response = requests.get(
            f"https://data.rcsb.org/rest/v1/core/entry/{first_pdb_id}", timeout=10,
        )
        metadata_response.raise_for_status()
        metadata = metadata_response.json()
    except requests.RequestException as exc:
        logger.exception("Failed to fetch metadata for PDB ID %r", first_pdb_id)
        raise HTTPException(
            status_code=502, detail=f"Failed to fetch metadata for PDB ID: {first_pdb_id}",
        ) from exc
    except ValueError as exc:
        logger.exception("Malformed JSON from metadata endpoint for PDB ID %r", first_pdb_id)
        raise HTTPException(
            status_code=502, detail="Malformed response from PDB metadata service."
        ) from exc

    organisms = metadata.get("rcsb_entity_source_organism") or []
    exptl = metadata.get("exptl") or []
    resolution_list = metadata.get("rcsb_entry_info", {}).get("resolution_combined") or []

    pdb_metadata = {
        "pdb_id": first_pdb_id,
        "protein_name": metadata.get("struct", {}).get("title", "No protein name available"),
        "organism": organisms[0].get("scientific_name", "Organism unknown")
        if organisms
        else "Organism unknown",
        "experimental_method": exptl[0].get("method", "Unknown experimental method")
        if exptl
        else "Unknown experimental method",
        "resolution": resolution_list[0] if resolution_list else None,
        "year": metadata.get("rcsb_primary_citation", {}).get("year", "N/A"),
        "authors": metadata.get("rcsb_primary_citation", {}).get("rcsb_authors", []),
        "keywords": metadata.get("struct_keywords", {}).get("pdbx_keywords", "No keywords"),
    }

    return {"pdb_id": first_pdb_id, "metadata": pdb_metadata}
