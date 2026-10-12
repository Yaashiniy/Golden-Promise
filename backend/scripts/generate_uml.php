<?php

$plantuml_text = <<<UML
@startuml
left to right direction

' Force plain black and white styling (resolves Draw.io transparent-to-black bug)
skinparam BackgroundColor #FFFFFF

' System Boundary Box
skinparam RectangleBackgroundColor #FFFFFF
skinparam RectangleBorderColor #000000
skinparam RectangleFontColor #000000

' Use Case Bubbles
skinparam UseCaseBackgroundColor #FFFFFF
skinparam UseCaseBorderColor #000000
skinparam UseCaseFontColor #000000

' Actors
skinparam ActorBackgroundColor #FFFFFF
skinparam ActorBorderColor #000000
skinparam ActorFontColor #000000

' Arrows and Lines
skinparam ArrowColor #000000
skinparam ArrowFontColor #000000

actor "Couple (User)" as couple
actor "Vendor" as vendor
actor "Administrator" as admin

rectangle "Golden Promise System" {
  ' --- Couple Section ---
  usecase "Login / Logout" as UC_auth
  usecase "Browse & Filter Directory\\n(Venues / Vendors)" as UC_browse
  usecase "Bookmark / Favorite Listing" as UC_favorite
  usecase "Contact Vendor Directly\\n(Via WhatsApp Link)" as UC_whatsapp
  usecase "Manage Budget Items" as UC_budget
  usecase "Manage Wedding Checklist" as UC_checklist
  usecase "Generate AI Budget Setup" as UC_ai_budget
  usecase "Generate AI Checklist Tasks" as UC_ai_checklist
  
  ' --- Vendor Section ---
  usecase "Vendor Portal Login" as UC_vendor_auth
  usecase "Submit Application" as UC_apply
  usecase "Upload SSM & NRIC" as UC_upload
  usecase "Stripe Subscription Payment\\n(Premium/Elite Tiers)" as UC_pay
  usecase "Manage Listing Profile\\n(Bio, Info, Photos)" as UC_profile
  usecase "View Profile Analytics\\n(WhatsApp Clicks, Views)" as UC_analytics
  
  ' --- Admin Section ---
  usecase "Admin Panel Login" as UC_admin_auth
  usecase "Audit Pending Applications" as UC_review
  usecase "Approve / Reject Listing\\n(Request Amendments)" as UC_decision
}

' Couple Connections (Actor on Left)
couple -- UC_auth
couple -- UC_browse
couple -- UC_budget
couple -- UC_checklist

' Couple Extensions (Arrows pointing to base use cases)
UC_favorite .left.> UC_browse : <<extend>>
UC_whatsapp .left.> UC_browse : <<extend>>
UC_ai_budget .left.> UC_budget : <<extend>>
UC_ai_checklist .left.> UC_checklist : <<extend>>

' Vendor Connections (Actor on Right)
UC_vendor_auth -- vendor
UC_apply -- vendor
UC_profile -- vendor
UC_analytics -- vendor

' Vendor Relationships
UC_apply .down.> UC_upload : <<include>>
UC_pay .right.> UC_apply : <<extend>>

' Admin Connections (Actor on Right)
UC_admin_auth -- admin
UC_review -- admin

' Admin Relationships
UC_decision .up.> UC_review : <<extend>>

' Layout helpers to vertical-align sections
UC_browse -[hidden]down- UC_apply
UC_apply -[hidden]down- UC_review

@enduml
UML;

function plantuml_encode($text) {
    $compressed = gzdeflate($text, 9);
    $base64 = base64_encode($compressed);
    
    $from = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    $to   = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
    
    return strtr($base64, $from, $to);
}

$encoded = plantuml_encode($plantuml_text);
$url = "http://www.plantuml.com/plantuml/png/" . $encoded;

echo "Downloading from: " . $url . "\n";

$output_dir = "C:\\Users\\User\\.gemini\\antigravity\\brain\\f3f3a509-01b8-47ec-b4ae-b64d6aa6d415";
if (!file_exists($output_dir)) {
    mkdir($output_dir, 0777, true);
}
$output_path = $output_dir . "\\use_case_diagram.png";

$img_data = file_get_contents($url);
if ($img_data === false) {
    echo "Error: Could not fetch from PlantUML server.\n";
    exit(1);
}

if (file_put_contents($output_path, $img_data) === false) {
    echo "Error: Could not save image file.\n";
    exit(1);
}

echo "Success! Saved to " . $output_path . "\n";
