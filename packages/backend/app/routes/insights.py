from datetime import date
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..services.ai import monthly_budget_suggestion

bp = Blueprint("insights", __name__)


@bp.get("/budget-suggestion")
@jwt_required()
def budget_suggestion():
    uid = int(get_jwt_identity())
    ym = date.today().strftime("%Y-%m")
    suggestion = monthly_budget_suggestion(uid, ym)
    return jsonify(suggestion)
