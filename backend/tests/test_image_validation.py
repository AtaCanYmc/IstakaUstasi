import io

import pytest
from fastapi import HTTPException, UploadFile
from PIL import Image

from app.dependencies.image_validation import validate_and_sanitize_image


@pytest.mark.asyncio
async def test_validate_and_sanitize_image_valid():
    # Create a simple valid image in memory
    img_byte_arr = io.BytesIO()
    image = Image.new("RGB", (100, 100), color="red")
    image.save(img_byte_arr, format="JPEG")
    img_byte_arr.seek(0)

    upload_file = UploadFile(filename="test.jpg", file=img_byte_arr)

    sanitized_bytes = await validate_and_sanitize_image(upload_file)
    assert len(sanitized_bytes) > 0

    # Confirm it parses again
    img = Image.open(io.BytesIO(sanitized_bytes))
    assert img.format == "JPEG"


@pytest.mark.asyncio
async def test_validate_and_sanitize_image_invalid_type():
    file_bytes = b"not an image file content"
    upload_file = UploadFile(filename="test.txt", file=io.BytesIO(file_bytes))

    with pytest.raises(HTTPException) as excinfo:
        await validate_and_sanitize_image(upload_file)
    assert excinfo.value.status_code == 400
    assert "not a valid image" in excinfo.value.detail


@pytest.mark.asyncio
async def test_validate_and_sanitize_image_too_large():
    # Make a dummy large file (6MB)
    large_bytes = b"0" * (6 * 1024 * 1024)
    upload_file = UploadFile(filename="test.jpg", file=io.BytesIO(large_bytes))

    with pytest.raises(HTTPException) as excinfo:
        await validate_and_sanitize_image(upload_file)
    assert excinfo.value.status_code == 400
    assert "too large" in excinfo.value.detail
