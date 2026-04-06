# This file's ONLY job is to import every model so SQLAlchemy's mapper
# registry has all classes available before any query runs.
#
# ORDER MATTERS:
#   1. Base first
#   2. Models with no FK dependencies (Role)
#   3. Models that depend on others (User → Role)
#   4. Models that depend on User (FinancialRecord → User)
#
# If FinancialRecord is missing here, User's relationship("FinancialRecord")
# will raise InvalidRequestError: failed to locate a name 'FinancialRecord'

from app.db.base_class import Base  # noqa: F401
from app.models.role import Role  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.financial_record import FinancialRecord  # noqa: F401