class AccessibilityRules:
    
    ADA_STANDARDS = {
        "door_width_min": 32,
        "corridor_width_min": 36,
        "ramp_slope_max": 8.33,
        "ramp_slope_ideal": 5.0,
        "lift_door_width_min": 36,
        "turning_space_diameter": 60
    }
    
    INDIAN_STANDARDS = {
        "door_width_min": 90,
        "corridor_width_min": 120,
        "ramp_slope_max": 8.33,
        "ramp_slope_ideal": 5.0,
        "lift_door_width_min": 90,
        "turning_space_diameter": 150
    }
    
    @staticmethod
    def check_door_compliance(width: float, standard: str = "ADA"):
        standards = AccessibilityRules.ADA_STANDARDS if standard == "ADA" else AccessibilityRules.INDIAN_STANDARDS
        min_width = standards["door_width_min"]
        
        if width >= min_width:
            return {"compliant": True, "severity": "pass", "message": f"Door width {width} meets minimum requirement"}
        else:
            return {"compliant": False, "severity": "critical", "message": f"Door width {width} below minimum {min_width}"}
    
    @staticmethod
    def check_corridor_compliance(width: float, standard: str = "ADA"):
        standards = AccessibilityRules.ADA_STANDARDS if standard == "ADA" else AccessibilityRules.INDIAN_STANDARDS
        min_width = standards["corridor_width_min"]
        
        if width >= min_width:
            return {"compliant": True, "severity": "pass", "message": f"Corridor width {width} is adequate"}
        else:
            return {"compliant": False, "severity": "critical", "message": f"Corridor width {width} below minimum {min_width}"}
    
    @staticmethod
    def check_ramp_compliance(slope: float, standard: str = "ADA"):
        standards = AccessibilityRules.ADA_STANDARDS if standard == "ADA" else AccessibilityRules.INDIAN_STANDARDS
        max_slope = standards["ramp_slope_max"]
        ideal_slope = standards["ramp_slope_ideal"]
        
        if slope <= ideal_slope:
            return {"compliant": True, "severity": "pass", "message": f"Ramp slope {slope}% is ideal"}
        elif slope <= max_slope:
            return {"compliant": True, "severity": "warning", "message": f"Ramp slope {slope}% is acceptable but not ideal"}
        else:
            return {"compliant": False, "severity": "critical", "message": f"Ramp slope {slope}% exceeds maximum {max_slope}%"}
    
    @staticmethod
    def check_lift_compliance(width: float, standard: str = "ADA"):
        standards = AccessibilityRules.ADA_STANDARDS if standard == "ADA" else AccessibilityRules.INDIAN_STANDARDS
        min_width = standards["lift_door_width_min"]
        
        if width >= min_width:
            return {"compliant": True, "severity": "pass", "message": f"Lift door width {width} is compliant"}
        else:
            return {"compliant": False, "severity": "critical", "message": f"Lift door width {width} below minimum {min_width}"}
