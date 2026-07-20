# Roboflow API Key and Vision Analysis Setup Guide

This document describes step-by-step how to configure and run the visual scanning (detecting tiles from images) feature of the Istaka Ustası application using your own Roboflow account and API key.

---

## Why Should I Use My Own API Key?
Istaka Ustası supports a **BYOK (Bring Your Own Key)** infrastructure for your security and unlimited use. Your API key is strongly encrypted on the server side using the AES-256 algorithm and is never stored in plain text. By entering your own Roboflow credentials, you can perform unlimited image analyses without hitting the free-tier system quotas.

---

## Step-by-Step Roboflow Setup

### Step 1: Create a Roboflow Account
1. Go to the [Roboflow Website](https://roboflow.com/).
2. Create a free developer account or log in if you already have one.

### Step 2: Get Your Private API Key
1. Click on your profile icon in the top-right corner and select **"Settings"**.
2. Select your workspace under the **"Workspaces"** tab on the left menu.
3. Click on the **"API Keys"** option.
4. Copy the secret key under the **"Private API Key"** heading (e.g., `rf_xxxxxxxxxxxxxxxxxxxxxxxx`).
   * *Note: Keep this key secure. Do not share it with anyone.*

### Step 3: Get Your Workspace Name
1. Navigate to your Roboflow dashboard.
2. Find the workspace name from the URL in your browser's address bar or from the Workspace settings.
   * For example, in the URL `https://app.roboflow.com/ata-dc7ry/...`, `ata-dc7ry` is your **Workspace** name.

### Step 4: Create or Define Your Workflow
Istaka Ustası uses Roboflow's **Workflows** infrastructure to analyze images.
1. In your Roboflow Workspace, go to the **"Workflows"** tab in the left menu.
2. Create a new workflow or link your YOLOv8-based tile detection model to the workflow.
3. Copy the unique **Workflow ID** of your workflow.
   * For example: `okey-and-rummikub-vrummikub-p8akb-vr0ef-3-yolov8n-t1-logic`.

---

## Configuring the Credentials in Istaka Ustası

To input this information into the Istaka Ustası application:
1. Open the application and click on the **Settings** (profile) button in the header.
2. Fill in the following fields under the Roboflow Settings section:
   - **API Key**: The copied `rf_...` secret key.
   - **Workspace**: Your Workspace name (e.g., `ata-dc7ry`).
   - **Workflow ID**: Your Workflow ID.
   - **API URL**: You can leave this as the default `https://serverless.roboflow.com`.
3. Click the **Save** button.

Once your credentials are saved, the system will route all image scanning requests directly through your own account.
