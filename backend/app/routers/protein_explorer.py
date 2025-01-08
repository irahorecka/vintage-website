from fastapi import APIRouter, HTTPException
import requests
from rcsbsearchapi.search import TextQuery


router = APIRouter()


@router.get("/protein", response_model=dict)
async def search_pdb(keyword: str):
    """
    Search for PDB entries based on a keyword and return metadata for the best match.

    Args:
        keyword (str): The keyword entered by the user to search for PDB entries.

    Returns:
        dict: A dictionary containing the best matching PDB ID and its metadata.
    """
    try:
        # Perform the text query using the provided keyword
        found_pdbs = list(TextQuery(value=keyword)())
        if not found_pdbs:
            raise HTTPException(status_code=404, detail="No PDB entries found.")

        # Use the first hit as the best match
        first_pdb_id = found_pdbs[0]

        # Fetch metadata for the first PDB ID
        metadata_url = f"https://data.rcsb.org/rest/v1/core/entry/{first_pdb_id}"
        metadata_response = requests.get(metadata_url)

        if metadata_response.status_code != 200:
            raise HTTPException(
                status_code=500, detail=f"Failed to fetch metadata for PDB ID: {first_pdb_id}"
            )

        metadata = metadata_response.json()

        # Extract relevant metadata fields
        pdb_metadata = {
            "pdb_id": first_pdb_id,
            "protein_name": metadata.get("struct", {}).get("title", "No protein name available"),
            "organism": metadata.get("rcsb_entity_source_organism", [{}])[0].get(
                "scientific_name", "Organism unknown"
            ),
            "experimental_method": metadata.get("exptl", [{}])[0].get(
                "method", "Unknown experimental method"
            ),
            "resolution": metadata.get("rcsb_entry_info", {}).get("resolution_combined", [None])[0],
            "year": metadata.get("rcsb_primary_citation", {}).get("year", "N/A"),
            "authors": metadata.get("rcsb_primary_citation", {}).get("rcsb_authors", []),
            "keywords": metadata.get("struct_keywords", {}).get("pdbx_keywords", "No keywords"),
        }

        # Return the first hit along with its metadata
        return {"pdb_id": first_pdb_id, "metadata": pdb_metadata}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during PDB search: {str(e)}")
