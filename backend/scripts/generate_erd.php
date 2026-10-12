<?php

$mermaid_text = <<<MERMAID
erDiagram
    users {
        bigint id PK
        string name
        string email
        string password
        string role
        timestamp created_at
    }

    vendors {
        bigint id PK
        bigint user_id FK
        bigint category_id FK
        string business_name
        string slug
        string business_type
        text description
        string phone
        string email
        string website
        string instagram
        boolean is_approved
        string subscription_tier
    }

    vendor_categories {
        bigint id PK
        string name
        string slug
    }

    vendor_applications {
        bigint id PK
        bigint user_id FK
        string business_name
        string ssm_number
        string social_link
        string applicant_name
        string status
        text notes
    }

    budgets {
        bigint id PK
        bigint user_id FK
        decimal total_budget
        decimal allocated_budget
    }

    budget_categories {
        bigint id PK
        bigint budget_id FK
        string name
    }

    budget_items {
        bigint id PK
        bigint category_id FK
        bigint vendor_id FK
        string name
        decimal estimated_cost
        decimal actual_cost
        boolean paid
    }

    checklist_items {
        bigint id PK
        bigint user_id FK
        string title
        text description
        date due_date
        string status
        string category
    }

    favorites {
        bigint id PK
        bigint user_id FK
        string favoritable_type
        bigint favoritable_id
    }

    vendor_analytics_logs {
        bigint id PK
        bigint vendor_id FK
        string log_type
        string ip_address
        string user_agent
        timestamp created_at
    }

    %% Relationships
    users ||--o| vendors : "owns"
    users ||--o{ vendor_applications : "submits"
    users ||--o| budgets : "manages"
    users ||--o{ checklist_items : "tracks"
    users ||--o{ favorites : "saves"
    
    vendor_categories ||--o{ vendors : "classifies"
    vendors ||--o{ vendor_analytics_logs : "records"
    vendors ||--o{ favorites : "is_marked"
    
    budgets ||--o{ budget_categories : "contains"
    budget_categories ||--o{ budget_items : "contains"
    vendors ||--o{ budget_items : "linked_to"
MERMAID;

// Encode Mermaid diagram using standard base64 for Mermaid.ink
$encoded = base64_encode($mermaid_text);
$url = "https://mermaid.ink/img/" . $encoded;

echo "Downloading ERD from: " . $url . "\n";

$output_dir = "C:\\Users\\User\\.gemini\\antigravity\\brain\\f3f3a509-01b8-47ec-b4ae-b64d6aa6d415";
if (!file_exists($output_dir)) {
    mkdir($output_dir, 0777, true);
}
$output_path = $output_dir . "\\erd_diagram.png";

$img_data = file_get_contents($url);
if ($img_data === false) {
    echo "Error: Could not fetch from Mermaid.ink API.\n";
    exit(1);
}

if (file_put_contents($output_path, $img_data) === false) {
    echo "Error: Could not save image file.\n";
    exit(1);
}

echo "Success! Saved to " . $output_path . "\n";
