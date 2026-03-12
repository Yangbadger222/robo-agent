# RoboAgent Demo Script

## Prerequisites

1. Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cd robo-agent/backend
   cp .env.example .env
   # Edit .env with your OPENAI_API_KEY (required), NEXAR_CLIENT_ID, NEXAR_CLIENT_SECRET (optional)
   ```

2. Start the backend:
   ```bash
   cd robo-agent/backend
   pip install -e ".[dev]"
   python -m rag.ingest  # ingest seed documents
   uvicorn main:app --reload --port 8000
   ```

3. Start the frontend:
   ```bash
   cd robo-agent/frontend
   npm install
   npm run dev
   ```

4. Open http://localhost:3000

---

## Demo Flow

### Step 1: Project Definition

Fill in the form:
- **Robot Name**: `Explorer Arm V1`
- **Robot Type**: `arm`
- **DOF**: `6`
- **Payload**: `2.0` kg
- **Reach**: `0.65` m
- **Budget**: `1500` USD
- **Description**: `A 6-DOF desktop robotic arm for pick-and-place tasks in a lab environment. Needs to handle small electronic components with precision.`

Click **Save & Continue**.

### Step 2: Structure Design

Click **Generate URDF with AI** and wait for the AI to generate the URDF.

In the chat panel, you can refine:
> "Make the wrist joints lighter and add a gripper link at the end."

Review the generated URDF in the code viewer. The parsed structure shows links and joints.

Click **Confirm Structure & Continue**.

### Step 3: Motor Selection

Click **Find Motors with AI**. The AI will:
- Analyze torque requirements per joint
- Search for real motors (via Nexar if configured)
- Recommend motors with prices

Review the motor table. Ask in chat:
> "Can you find cheaper alternatives for the shoulder motors?"

Click **Confirm Motors & Continue**.

### Step 4: Hardware

Click **Recommend Hardware with AI**. The AI recommends:
- MCU/Controller
- Motor drivers matched to selected motors
- Sensors (encoders, IMU)
- Communication modules
- Power supply

Ask in chat:
> "I need CAN bus communication for all motor drivers."

Click **Confirm Hardware & Continue**.

### Step 5: Software

Check the boxes for:
- [x] ROS 2 Nodes
- [x] Isaac Lab RL Environment
- [x] Launch Files

Click **Generate Software with AI**. Browse generated files in the file tree.

Ask in chat:
> "Add a force/torque sensor subscriber node."

Click **Confirm Software & Continue**.

### Step 6: Review & Export

Review all sections:
- Project summary
- Structure overview
- Bill of Materials with total cost
- Generated files list

Click **Download All (ZIP)** to export everything.

---

## Rollback Demo

1. Go back to **Step 1** and change DOF from 6 to 4
2. Notice steps 2-5 become **stale** (amber warning)
3. Navigate to **Step 2** and click **Re-run**
4. The structure regenerates with 4 DOF
5. Continue through each stale step to re-run

---

## Docker Demo (Alternative)

```bash
cd robo-agent
docker-compose up --build
```

Open http://localhost:3000 and follow the same flow above.
