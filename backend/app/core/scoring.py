class InclusionScoreCalculator:
    
    @staticmethod
    def calculate_score(annotations: list, standard: str = "ADA"):
        if not annotations:
            return {
                "overall_score": 0,
                "category_scores": {},
                "total_elements": 0,
                "compliant_elements": 0,
                "critical_issues": 0,
                "warnings": 0
            }
        
        total_elements = len(annotations)
        compliant_elements = 0
        critical_issues = 0
        warnings = 0
        
        category_scores = {
            "doors": {"total": 0, "compliant": 0},
            "corridors": {"total": 0, "compliant": 0},
            "ramps": {"total": 0, "compliant": 0},
            "lifts": {"total": 0, "compliant": 0}
        }
        
        for annotation in annotations:
            element_type = annotation.get("element_type")
            compliance = annotation.get("compliance", {})
            
            if element_type in category_scores:
                category_scores[element_type]["total"] += 1
                
                if compliance.get("compliant"):
                    compliant_elements += 1
                    category_scores[element_type]["compliant"] += 1
                    
                    if compliance.get("severity") == "warning":
                        warnings += 1
                else:
                    if compliance.get("severity") == "critical":
                        critical_issues += 1
        
        overall_score = (compliant_elements / total_elements * 100) if total_elements > 0 else 0
        
        category_percentages = {}
        for category, data in category_scores.items():
            if data["total"] > 0:
                category_percentages[category] = (data["compliant"] / data["total"]) * 100
            else:
                category_percentages[category] = 0
        
        return {
            "overall_score": round(overall_score, 2),
            "category_scores": category_percentages,
            "total_elements": total_elements,
            "compliant_elements": compliant_elements,
            "critical_issues": critical_issues,
            "warnings": warnings
        }
    
    @staticmethod
    def generate_recommendations(annotations: list, score_data: dict):
        recommendations = []
        
        if score_data["critical_issues"] > 0:
            recommendations.append({
                "priority": "high",
                "category": "critical",
                "message": f"Address {score_data['critical_issues']} critical accessibility issues immediately"
            })
        
        for annotation in annotations:
            if not annotation.get("compliance", {}).get("compliant"):
                recommendations.append({
                    "priority": "high" if annotation["compliance"].get("severity") == "critical" else "medium",
                    "category": annotation.get("element_type"),
                    "element_id": annotation.get("id"),
                    "message": annotation["compliance"].get("message"),
                    "suggestion": InclusionScoreCalculator._get_suggestion(annotation)
                })
        
        if score_data["warnings"] > 0:
            recommendations.append({
                "priority": "medium",
                "category": "optimization",
                "message": f"Consider optimizing {score_data['warnings']} elements for better accessibility"
            })
        
        return recommendations
    
    @staticmethod
    def _get_suggestion(annotation):
        element_type = annotation.get("element_type")
        compliance = annotation.get("compliance", {})
        
        suggestions = {
            "doors": "Increase door width to meet minimum clearance requirements",
            "corridors": "Widen corridor to allow wheelchair passage and turning space",
            "ramps": "Reduce ramp slope by extending the ramp length",
            "lifts": "Ensure lift door width meets accessibility standards"
        }
        
        return suggestions.get(element_type, "Review element specifications")
