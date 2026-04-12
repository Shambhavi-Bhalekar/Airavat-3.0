"""
Systemic Pattern Intelligence Engine for JusticeGrid
Surfaces insights from the case corpus without modifying database structure.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, List
from db import supabase
import traceback

def get_charge_section_delays() -> Dict:
    """
    Returns: Which charge sections drive the longest undertrial detention.
    Aggregates detention_days by assigned_ipc section.
    """
    try:
        res = supabase.table("cases").select("assigned_ipc, detention_days, eligible").execute()
        cases = res.data or []
        
        # Group by charge section
        section_stats = {}
        for case in cases:
            ipc = case.get("assigned_ipc", "Unknown")
            detention = case.get("detention_days", 0)
            eligible = case.get("eligible", False)
            
            if ipc not in section_stats:
                section_stats[ipc] = {
                    "total_cases": 0,
                    "total_detention_days": 0,
                    "avg_detention_days": 0,
                    "eligible_count": 0,
                    "confidence": 0.85  # Default confidence for aggregate insights
                }
            
            section_stats[ipc]["total_cases"] += 1
            section_stats[ipc]["total_detention_days"] += detention
            if eligible:
                section_stats[ipc]["eligible_count"] += 1
        
        # Calculate averages
        for ipc in section_stats:
            total = section_stats[ipc]["total_cases"]
            section_stats[ipc]["avg_detention_days"] = (
                section_stats[ipc]["total_detention_days"] / total if total > 0 else 0
            )
        
        # Sort by avg detention descending
        sorted_sections = sorted(
            section_stats.items(), 
            key=lambda x: x[1]["avg_detention_days"], 
            reverse=True
        )
        
        return {
            "status": "success",
            "insights": dict(sorted_sections[:10]),  # Top 10 sections
            "total_sections_analyzed": len(section_stats),
            "uncertainty_note": "Averages computed from all cases; confidence varies by sample size",
            "confidence": 0.85,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in get_charge_section_delays: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": str(e),
            "insights": {},
            "confidence": 0.0
        }


def get_court_bail_intervals() -> Dict:
    """
    Returns: Which courts have the worst bail-decision intervals.
    Aggregates bail_delay_days by court_name for cases with bail_status.
    """
    try:
        res = supabase.table("cases").select(
            "court_name, bail_delay_days, bail_status, eligible, confidence"
        ).execute()
        cases = res.data or []
        
        # Group by court
        court_stats = {}
        for case in cases:
            court = case.get("court_name", "Unknown Court")
            bail_delay = case.get("bail_delay_days")
            bail_status = case.get("bail_status")
            eligible = case.get("eligible", False)
            case_confidence = case.get("confidence", 0.75)
            
            # Only count cases with bail status
            if bail_status and bail_delay is not None:
                if court not in court_stats:
                    court_stats[court] = {
                        "total_cases_with_bail": 0,
                        "total_delay_days": 0,
                        "avg_bail_delay_days": 0,
                        "eligible_cases_delayed": 0,
                        "worst_case_delay_days": 0,
                        "avg_confidence": 0,
                        "confidence_scores": []
                    }
                
                court_stats[court]["total_cases_with_bail"] += 1
                court_stats[court]["total_delay_days"] += bail_delay
                court_stats[court]["worst_case_delay_days"] = max(
                    court_stats[court]["worst_case_delay_days"], 
                    bail_delay
                )
                court_stats[court]["confidence_scores"].append(case_confidence)
                if eligible and bail_delay > 30:
                    court_stats[court]["eligible_cases_delayed"] += 1
        
        # Calculate averages
        for court in court_stats:
            total = court_stats[court]["total_cases_with_bail"]
            court_stats[court]["avg_bail_delay_days"] = (
                court_stats[court]["total_delay_days"] / total if total > 0 else 0
            )
            scores = [s for s in court_stats[court]["confidence_scores"] if s is not None]
            court_stats[court]["avg_confidence"] = sum(scores) / len(scores) if scores else 0.75
            del court_stats[court]["confidence_scores"]  # Clean up for return
        
        # Sort by avg bail delay descending
        sorted_courts = sorted(
            court_stats.items(), 
            key=lambda x: x[1]["avg_bail_delay_days"], 
            reverse=True
        )
        
        return {
            "status": "success",
            "insights": dict(sorted_courts[:10]),  # Top 10 courts
            "total_courts_analyzed": len(court_stats),
            "uncertainty_note": "Intervals based on bail_delay_days; some courts may have limited data",
            "confidence": 0.80,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in get_court_bail_intervals: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": str(e),
            "insights": {},
            "confidence": 0.0
        }


def get_prison_eligible_density() -> Dict:
    """
    Returns: Which prisons have the highest density of eligible-but-unserved undertrials.
    Aggregates cells by prison_name where eligible=true but case_closed=false.
    """
    try:
        res = supabase.table("cases").select(
            "prison_name, eligible, case_closed, detention_days, confidence"
        ).execute()
        cases = res.data or []
        
        # Group by prison
        prison_stats = {}
        for case in cases:
            prison = case.get("prison_name", "Unknown Prison")
            eligible = case.get("eligible", False)
            case_closed = case.get("case_closed", False)
            detention = case.get("detention_days", 0)
            case_confidence = case.get("confidence", 0.75)
            
            if prison not in prison_stats:
                prison_stats[prison] = {
                    "total_undertrials": 0,
                    "eligible_unserved": 0,
                    "avg_detention_days": 0,
                    "total_detention_days": 0,
                    "eligible_density_percent": 0,
                    "avg_confidence": 0,
                    "confidence_scores": []
                }
            
            prison_stats[prison]["total_undertrials"] += 1
            prison_stats[prison]["total_detention_days"] += detention
            prison_stats[prison]["confidence_scores"].append(case_confidence)
            
            # Eligible but not yet released/closed
            if eligible and not case_closed:
                prison_stats[prison]["eligible_unserved"] += 1
        
        # Calculate percentages and averages
        for prison in prison_stats:
            total = prison_stats[prison]["total_undertrials"]
            prison_stats[prison]["eligible_density_percent"] = (
                (prison_stats[prison]["eligible_unserved"] / total * 100) if total > 0 else 0
            )
            prison_stats[prison]["avg_detention_days"] = (
                prison_stats[prison]["total_detention_days"] / total if total > 0 else 0
            )
            scores = [s for s in prison_stats[prison]["confidence_scores"] if s is not None]
            prison_stats[prison]["avg_confidence"] = sum(scores) / len(scores) if scores else 0.75
            del prison_stats[prison]["confidence_scores"]  # Clean up
        
        # Sort by eligible density descending
        sorted_prisons = sorted(
            prison_stats.items(), 
            key=lambda x: x[1]["eligible_density_percent"], 
            reverse=True
        )
        
        return {
            "status": "success",
            "insights": dict(sorted_prisons[:10]),  # Top 10 prisons
            "total_prisons_analyzed": len(prison_stats),
            "uncertainty_note": "Density based on current eligible and case_closed flags; real-time data dependent",
            "confidence": 0.82,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in get_prison_eligible_density: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": str(e),
            "insights": {},
            "confidence": 0.0
        }


def get_surety_blocking_analysis() -> Dict:
    """
    Returns: Which surety amounts are blocking bail execution, correlated with local poverty indicators.
    Analyzes surety_amount vs local median wages (from financial_intelligence.py).
    """
    from financial_intelligence import MEDIAN_WAGE_MAP, DEFAULT_MEDIAN_WAGE
    
    try:
        res = supabase.table("cases").select(
            "city, surety_amount, surety_blocked, bail_status, detention_days, eligible, confidence"
        ).execute()
        cases = res.data or []
        
        # Group by city
        city_stats = {}
        for case in cases:
            city = case.get("city", "Unknown City")
            surety = case.get("surety_amount")  # Can be None
            surety_blocked = case.get("surety_blocked", False)
            bail_status = case.get("bail_status")
            detention = case.get("detention_days", 0) or 0  # Handle None
            eligible = case.get("eligible", False)
            case_confidence = case.get("confidence", 0.75)
            
            if city not in city_stats:
                median_wage = MEDIAN_WAGE_MAP.get(city, DEFAULT_MEDIAN_WAGE)
                city_stats[city] = {
                    "median_daily_wage": median_wage,
                    "ninety_day_earning_capacity": median_wage * 90,
                    "total_bail_cases": 0,
                    "surety_blocked_count": 0,
                    "total_surety_amount": 0,
                    "avg_surety_amount": 0,
                    "avg_detention_days": 0,
                    "total_detention_days": 0,
                    "blocking_ratio": 0,  # % of sureties exceeding 90-day capacity
                    "avg_confidence": 0,
                    "confidence_scores": []
                }
            
            # Track bail-related cases
            if bail_status:
                city_stats[city]["total_bail_cases"] += 1
                if surety is not None:
                    city_stats[city]["total_surety_amount"] += surety
                city_stats[city]["total_detention_days"] += detention
                if case_confidence is not None:
                    city_stats[city]["confidence_scores"].append(case_confidence)
                
                if surety_blocked:
                    city_stats[city]["surety_blocked_count"] += 1
                
                # Check if surety exceeds 90-day earning cap
                if surety is not None and surety > city_stats[city]["ninety_day_earning_capacity"]:
                    city_stats[city]["surety_blocked_count"] += 1
        
        # Calculate percentages and averages
        for city in city_stats:
            total = city_stats[city]["total_bail_cases"]
            if total > 0:
                city_stats[city]["avg_surety_amount"] = (
                    city_stats[city]["total_surety_amount"] / total
                )
                city_stats[city]["avg_detention_days"] = (
                    city_stats[city]["total_detention_days"] / total
                )
                city_stats[city]["blocking_ratio"] = (
                    city_stats[city]["surety_blocked_count"] / total * 100
                )
                scores = [s for s in city_stats[city]["confidence_scores"] if s is not None]
                city_stats[city]["avg_confidence"] = sum(scores) / len(scores) if scores else 0.75
            
            del city_stats[city]["confidence_scores"]  # Clean up
        
        # Sort by blocking ratio descending
        sorted_cities = sorted(
            city_stats.items(), 
            key=lambda x: x[1]["blocking_ratio"], 
            reverse=True
        )
        
        return {
            "status": "success",
            "insights": dict(sorted_cities[:15]),  # Top 15 cities
            "total_cities_analyzed": len(city_stats),
            "uncertainty_note": "Based on local median wage estimates and current surety data. Real poverty indicators would require additional data sources.",
            "confidence": 0.70,  # Lower confidence due to reliance on wage proxies
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in get_surety_blocking_analysis: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": str(e),
            "insights": {},
            "confidence": 0.0
        }


def get_pattern_high_adjournments_by_quarter() -> Dict:
    """
    Returns: Courts where eligible cases have been adjourned 20+ times in a quarter.
    Queries for cases where eligible=true and high adjournment_prob, groups by court and date range.
    """
    try:
        # Calculate quarter start (last 3 months)
        now = datetime.now()
        quarter_start = now - timedelta(days=90)
        quarter_start_iso = quarter_start.isoformat()
        
        # Get cases from last quarter
        res = supabase.table("cases").select(
            "id, court_name, eligible, adjournment_prob, last_hearing_date, reason, confidence"
        ).gte("created_at", quarter_start_iso).execute()
        
        cases = res.data or []
        
        # Group by court and count high adjournments for eligible cases
        court_adjournment_patterns = {}
        for case in cases:
            court = case.get("court_name", "Unknown Court")
            eligible = case.get("eligible", False)
            adj_prob = case.get("adjournment_prob") or 0  # Handle None
            case_confidence = case.get("confidence", 0.75)
            
            if eligible and adj_prob is not None and adj_prob >= 70:  # HIGH adjournment probability
                if court not in court_adjournment_patterns:
                    court_adjournment_patterns[court] = {
                        "high_risk_adjournments": 0,
                        "total_eligible_cases": 0,
                        "case_ids": [],
                        "avg_adjournment_prob": 0,
                        "alert_level": "LOW",
                        "avg_confidence": 0,
                        "confidence_scores": []
                    }
                
                court_adjournment_patterns[court]["high_risk_adjournments"] += 1
                court_adjournment_patterns[court]["case_ids"].append(case.get("id"))
                court_adjournment_patterns[court]["confidence_scores"].append(case_confidence)
            
            if eligible:
                if court not in court_adjournment_patterns:
                    court_adjournment_patterns[court] = {
                        "high_risk_adjournments": 0,
                        "total_eligible_cases": 0,
                        "case_ids": [],
                        "avg_adjournment_prob": 0,
                        "alert_level": "LOW",
                        "avg_confidence": 0,
                        "confidence_scores": []
                    }
                court_adjournment_patterns[court]["total_eligible_cases"] += 1
        
        # Determine alert levels
        alerts = []
        for court, pattern in court_adjournment_patterns.items():
            high_count = pattern["high_risk_adjournments"]
            
            # Calculate confidence
            scores = [s for s in pattern["confidence_scores"] if s is not None]
            pattern["avg_confidence"] = sum(scores) / len(scores) if scores else 0.75
            del pattern["confidence_scores"]
            
            # Determine alert level
            if high_count >= 20:
                pattern["alert_level"] = "CRITICAL"
                alerts.append({
                    "court": court,
                    "high_adjournment_count": high_count,
                    "alert_level": "CRITICAL",
                    "recommendation": f"Immediate UTRC intervention needed. {high_count} eligible cases at high adjournment risk in last quarter.",
                    "confidence": pattern["avg_confidence"],
                    "case_count": pattern["total_eligible_cases"]
                })
            elif high_count >= 10:
                pattern["alert_level"] = "WARNING"
                alerts.append({
                    "court": court,
                    "high_adjournment_count": high_count,
                    "alert_level": "WARNING",
                    "recommendation": f"Monitor closely. {high_count} eligible cases at high adjournment risk.",
                    "confidence": pattern["avg_confidence"],
                    "case_count": pattern["total_eligible_cases"]
                })
        
        # Sort alerts by severity
        alerts.sort(key=lambda x: x["high_adjournment_count"], reverse=True)
        
        return {
            "status": "success",
            "quarter_range": f"{quarter_start.date()} to {now.date()}",
            "alerts": alerts,
            "total_courts_monitored": len(court_adjournment_patterns),
            "critical_alerts": len([a for a in alerts if a["alert_level"] == "CRITICAL"]),
            "warning_alerts": len([a for a in alerts if a["alert_level"] == "WARNING"]),
            "uncertainty_note": "Based on adjournment_prob predictions. Confidence intervals vary by case.",
            "overall_confidence": 0.75,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in get_pattern_high_adjournments_by_quarter: {traceback.format_exc()}")
        return {
            "status": "error",
            "message": str(e),
            "alerts": [],
            "confidence": 0.0
        }
