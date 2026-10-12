<?php

$plantuml_text = <<<UML
@startuml
skinparam linetype ortho
skinparam BackgroundColor #FFFFFF
skinparam ArrowColor #000000
skinparam ArrowFontColor #000000

' System Boundary Box
skinparam RectangleBackgroundColor #FFFFFF
skinparam RectangleBorderColor #000000
skinparam RectangleFontColor #000000
skinparam RectangleFontSize 14

' Use Case / Process Bubbles
skinparam UseCaseBackgroundColor #FFFFFF
skinparam UseCaseBorderColor #000000
skinparam UseCaseFontColor #000000
skinparam UseCaseFontSize 14

' External Entities in Corners
rectangle "Couple (User)" as couple
rectangle "Vendor" as vendor
rectangle "Administrator" as admin

' Central System process
rectangle "AI-Powered Wedding\\nManagement System\\n(Golden Promise)" as system

' Layout alignment constraints to place System in the center and actors in corners
couple -[hidden]down- vendor
couple -[hidden]right- system
system -[hidden]right- admin

' --- Couple Data Flows ---
couple --> system : "1. Search filters"
couple --> system : "2. Favorite requests"
couple --> system : "3. Budget updates"
couple --> system : "4. Checklist updates"
couple --> system : "5. AI chat prompts"

system --> couple : "6. Vendor details"
system --> couple : "7. WhatsApp contact links"
system --> couple : "8. AI planner suggestions"
system --> couple : "9. Budget analysis charts"

' --- Vendor Data Flows ---
vendor --> system : "10. Application details"
vendor --> system : "11. SSM & NRIC files"
vendor --> system : "12. Profile/photo updates"
vendor --> system : "13. Subscription request"

system --> vendor : "14. Verification status"
system --> vendor : "15. WhatsApp & View analytics"

' --- Admin Data Flows ---
admin --> system : "16. Login credentials"
admin --> system : "17. Approval decisions"
admin --> system : "18. Amendment requests"

system --> admin : "19. Pending application list"
system --> admin : "20. Uploaded SSM & NRIC files"

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
$output_path = $output_dir . "\\context_diagram.png";

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
