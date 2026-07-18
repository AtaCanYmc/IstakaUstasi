import io

from fastapi import File, HTTPException, UploadFile
from PIL import Image

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


async def validate_and_sanitize_image(file: UploadFile = File(...)) -> bytes:
    """
    Validates that the uploaded file is a valid image, enforces a 5MB size limit,
    verifies binary magic bytes (JPEG, PNG, WEBP), and strips metadata.
    """
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=(
                f"File is too large ({len(contents)} bytes). "
                "Max allowed size is 5MB."
            ),
        )

    # Magic Bytes / File Signature Validation
    is_jpeg = contents.startswith(b"\xff\xd8\xff")
    is_png = contents.startswith(b"\x89PNG\r\n\x1a\n")
    is_webp = (
        contents.startswith(b"RIFF")
        and len(contents) >= 12
        and contents[8:12] == b"WEBP"
    )

    if not (is_jpeg or is_png or is_webp):
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid file signature. "
                "Only JPEG, PNG, and WEBP images are allowed."
            ),
        )

    try:
        # Check image validity
        img = Image.open(io.BytesIO(contents))
        img.verify()
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is not a valid image or is corrupted.",
        )

    # Re-open the image to sanitize / strip EXIF
    try:
        img = Image.open(io.BytesIO(contents))
        fmt = img.format
        if fmt not in ("JPEG", "PNG", "WEBP"):
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Unsupported image format: {fmt}. "
                    "Only JPEG, PNG, and WEBP are supported."
                ),
            )

        # Save image to a clean byte stream without EXIF
        clean_io = io.BytesIO()
        img.save(clean_io, format=fmt)
        return clean_io.getvalue()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to process and sanitize image: {str(e)}",
        )
