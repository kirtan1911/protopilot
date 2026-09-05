from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Dict, Any

# ---------------------------------------------------------------------------
# Requirement Generation Models
# ---------------------------------------------------------------------------

class FunctionalRequirement(BaseModel):
    id: str = Field(..., description="Requirement ID (e.g., FR-001)")
    title: str
    description: str
    priority: Literal["High", "Medium", "Low"]
    actor: Optional[str] = None
    preconditions: Optional[str] = None
    main_flow: Optional[str] = None
    alternative_flow: Optional[str] = None
    postconditions: Optional[str] = None
    dependencies: Optional[List[str]] = []
    source_reference: Optional[str] = None
    confidence: Literal["High", "Medium", "Low"] = "High"

class NonFunctionalRequirement(BaseModel):
    id: str = Field(..., description="Requirement ID (e.g., NFR-001)")
    category: str = Field(..., description="E.g., Performance, Security")
    title: str
    description: str
    priority: Literal["High", "Medium", "Low"]
    confidence: Literal["High", "Medium", "Low"] = "High"

class UserPersona(BaseModel):
    name: str
    role: str
    goals: List[str] = []
    responsibilities: List[str] = []
    pain_points: List[str] = []
    permissions: List[str] = []
    main_actions: List[str] = []

class UserStory(BaseModel):
    id: str
    role: str
    action: str
    benefit: str
    acceptance_criteria: List[str] = []
    priority: Literal["High", "Medium", "Low"]
    related_requirement_id: Optional[str] = None

class UseCase(BaseModel):
    id: str
    name: str
    actor: str
    preconditions: str
    trigger: str
    main_flow: List[str] = []
    alternative_flow: List[str] = []
    exception_flow: List[str] = []
    postconditions: str

class BusinessRule(BaseModel):
    id: str
    description: str
    related_requirement: Optional[str] = None
    related_module: Optional[str] = None

class Module(BaseModel):
    name: str
    description: str
    features: List[str] = []

class ProjectRequirements(BaseModel):
    project_title: str
    project_type: str
    business_domain: str
    business_objective: str
    problem_statement: str
    target_users: List[str] = []
    stakeholders: List[str] = []
    existing_system: Optional[str] = None
    proposed_system: str
    main_business_processes: List[str] = []
    constraints: List[str] = []
    assumptions: List[str] = []
    dependencies: List[str] = []
    risks: List[str] = []
    missing_information: List[str] = []
    
    functional_requirements: List[FunctionalRequirement] = []
    non_functional_requirements: List[NonFunctionalRequirement] = []
    user_personas: List[UserPersona] = []
    user_stories: List[UserStory] = []
    use_cases: List[UseCase] = []
    business_rules: List[BusinessRule] = []
    modules: List[Module] = []
    
    requirement_completeness_score: int = Field(default=0, ge=0, le=100)
    ambiguities: List[str] = []
    potential_conflicts: List[str] = []
    recommended_questions: List[str] = []

# ---------------------------------------------------------------------------
# Clarification Models
# ---------------------------------------------------------------------------

class ClarificationQuestion(BaseModel):
    id: str
    question: str
    reason: str
    context: str

class ClarificationList(BaseModel):
    questions: List[ClarificationQuestion] = []

# ---------------------------------------------------------------------------
# Database Schema Models
# ---------------------------------------------------------------------------

class ColumnInfo(BaseModel):
    name: str
    type: str
    primary_key: bool = False
    nullable: bool = True
    unique: bool = False
    description: Optional[str] = None

class ForeignKeyInfo(BaseModel):
    column: str
    references_table: str
    references_column: str
    type: Literal["One-to-One", "One-to-Many", "Many-to-Many"]

class TableInfo(BaseModel):
    table_name: str
    description: str
    columns: List[ColumnInfo] = []
    foreign_keys: List[ForeignKeyInfo] = []
    indexes: List[str] = []
    validation_rules: List[str] = []

class DatabaseSchema(BaseModel):
    tables: List[TableInfo] = []
    health_score: int = Field(default=0, ge=0, le=100)
    missing_primary_keys: List[str] = []
    missing_foreign_keys: List[str] = []
    normalization_problems: List[str] = []

# ---------------------------------------------------------------------------
# API Specification Models
# ---------------------------------------------------------------------------

class ApiEndpoint(BaseModel):
    api_id: str
    module: str
    method: Literal["GET", "POST", "PUT", "PATCH", "DELETE"]
    endpoint: str
    purpose: str
    authentication: str
    authorization: str
    request_headers: Dict[str, str] = {}
    path_parameters: Dict[str, str] = {}
    query_parameters: Dict[str, str] = {}
    request_body: Optional[Dict[str, Any]] = None
    response_body: Optional[Dict[str, Any]] = None
    http_status_codes: Dict[str, str] = {}
    validation_errors: List[str] = []
    business_errors: List[str] = []
    related_database_tables: List[str] = []
    related_requirement_ids: List[str] = []

class ApiSpecification(BaseModel):
    base_url: str = "/api"
    endpoints: List[ApiEndpoint] = []
    health_score: int = Field(default=0, ge=0, le=100)

# ---------------------------------------------------------------------------
# UI / Wireframe Models
# ---------------------------------------------------------------------------

class PageManifestItem(BaseModel):
    id: str
    name: str
    route: str
    purpose: str
    module: str
    components_needed: List[str] = []

class PageManifest(BaseModel):
    pages: List[PageManifestItem] = []
    design_system: Dict[str, Any] = {}
