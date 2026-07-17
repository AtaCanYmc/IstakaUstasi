class DomainException(Exception):
    """Base exception for domain-specific errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ResourceNotFoundError(DomainException):
    """Exception raised when a requested resource is not found."""

    def __init__(self, resource_name: str, resource_id: str = None):
        msg = f"{resource_name} not found"
        if resource_id:
            msg += f" (ID: {resource_id})"
        super().__init__(msg, status_code=404)


class ProjectNotFoundError(ResourceNotFoundError):
    """Exception raised when a requested project is not found."""

    def __init__(self, project_id: str = None):
        super().__init__(resource_name="Project", resource_id=project_id)


class DatabaseError(DomainException):
    """Exception raised when a database operation fails."""

    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, status_code=500)


class ScraperDomainError(DomainException):
    """Exception raised when a scraping operation fails."""

    def __init__(self, platform: str, reason: str, status_code: int = 500):
        super().__init__(
            f"Scraping failed for {platform}: {reason}", status_code=status_code
        )
