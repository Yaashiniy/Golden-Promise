<?php

$plantuml_text = <<<UML
@startuml
skinparam linetype ortho
skinparam BackgroundColor #FFFFFF
skinparam ArrowColor #000000
skinparam ArrowFontColor #000000

' Styling for external entities
skinparam RectangleBackgroundColor #FFFFFF
skinparam RectangleBorderColor #000000
skinparam RectangleFontColor #000000
skinparam RectangleFontSize 13

' Central system styling (rounded rectangle)
skinparam UseCaseBackgroundColor #FFFFFF
skinparam UseCaseBorderColor #000000
skinparam UseCaseFontColor #000000
skinparam UseCaseFontSize 13

' Elements
rectangle "Couple (User)" as couple
rectangle "Vendor / Admin" as admin_vendor
usecase "System\\n(Golden Promise)" as system
rectangle "DB: PostgreSQL\\n(Users, Budgets, Checklists, Vendors)" as db
rectangle "Stripe" as stripe

' Layout positioning
couple -[hidden]down- admin_vendor
couple -[hidden]right- db
db -[hidden]down- stripe
system -[hidden]right- db

' --- Flows: Couple (User) ---
couple --> system : "Browse, Login, Favorites,\\nBudgeting, AI Planners"
system --> couple : "Vendor Details, WhatsApp Links,\\nAI Plans, Auth State"

' --- Flows: Vendor / Admin ---
admin_vendor --> system : "Manage Profile, Submit Application,\\nAudit Listings, View Analytics"

' --- Flows: Database ---
system --> db : "Read/Write Data"
db --> system : "Vendors, Users, Budgets,\\nChecklists, Logs"

' --- Flows: Stripe ---
system --> stripe : "Create Subscription"
stripe --> system : "Payment Confirmation"

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
$output_path = $output_dir . "\\context_diagram_senior.png";

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
