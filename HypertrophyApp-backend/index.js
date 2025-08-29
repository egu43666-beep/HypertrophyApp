require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const os = require('os');

const app = express();
app.use(cors());
app.use(express.json());

// Function to get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

// Get current IP address
const currentIP = getLocalIPAddress();

// Bedrock client setup
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Common model IDs to try
const MODEL_IDS = [
  'us.anthropic.claude-3-5-haiku-20241022-v1:0'
];

// GET endpoint to get current server IP
app.get('/api/server-info', (req, res) => {
  res.json({
    ip: currentIP,
    port: process.env.PORT || 4000,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/plan', async (req, res) => {
  try {
    const userAnswers = req.body;
    
    console.log('=== AWS BEDROCK CALL START ===');
    console.log('User Answers:', JSON.stringify(userAnswers, null, 2));
    console.log('AWS Region:', process.env.AWS_REGION || 'us-east-1');
    console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'NOT SET');
    console.log('AWS Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'NOT SET');
    
    // Create a comprehensive prompt for Bedrock
    const prompt = `You are an expert fitness trainer and nutritionist. Create a personalized hypertrophy (muscle building) plan based on the following user profile:

User Profile:
- Age: ${userAnswers.age}
- Biological Sex: ${userAnswers.biologicalSex}
- Height: ${userAnswers.height}
- Weight: ${userAnswers.weight}
- Training Experience: ${userAnswers.experienceLevel}
- Weight Goal: ${userAnswers.weightGoal}
- Available Training Days: ${userAnswers.daysPerWeek}
- Time per Workout: ${userAnswers.timePerWorkout}
- Equipment Available: ${userAnswers.equipment}
- Injuries/Limitations: ${userAnswers.injuries}
- Preferred Training Split: ${userAnswers.trainingSplit}
- Current Routine: ${userAnswers.currentRoutine}
- Supplements: ${userAnswers.supplements}
- Recovery Ability: ${userAnswers.recoveryAbility}
- Coaching Style Preference: ${userAnswers.coachingStyle}

Please provide a comprehensive, personalized hypertrophy plan that includes:

1. **Training Program**: For each exercise, specify the number of sets, reps, and intensity (using "reps in reserve" or RIR). Include rest periods, exercise order, and any warm-up/cool-down routines if requested. The program should be clear and actionable, like a real coach would provide.
2. **Progressive Overload Strategy**: How to increase intensity over time
3. **Nutrition Guidelines**: Specific dietary recommendations based on their goals and habits
4. **Recovery Protocols**: Rest days, sleep recommendations, and recovery techniques
5. **Progress Tracking**: How to monitor progress based on their preferences
6. **Safety Considerations**: Modifications for any injuries or limitations
7. **Motivation Strategies**: Coaching approach based on their style preference

Format the response as a structured plan with clear sections and actionable advice. Use bullet points or tables for the training program if helpful.`;

    console.log('Prompt created successfully');
    console.log('Prompt length:', prompt.length, 'characters');

    // Try different model IDs
    let planContent = null;
    let lastError = null;

    for (const modelId of MODEL_IDS) {
      try {
        console.log(`\n--- Trying model: ${modelId} ---`);
        
        const command = new InvokeModelCommand({
          modelId: modelId,
          contentType: 'application/json',
          body: JSON.stringify({
            anthropic_version: 'bedrock-2023-05-31',
            max_tokens: 4000,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          })
        });

        console.log('Command created successfully');
        console.log('Sending request to AWS Bedrock...');

        const response = await bedrock.send(command);
        
        console.log('✅ AWS Bedrock response received successfully!');
        console.log('Response status:', response.$metadata?.httpStatusCode);
        console.log('Response headers:', response.$metadata?.requestId);
        
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        console.log('Response body parsed successfully');
        console.log('Response content type:', typeof responseBody.content);
        
        if (responseBody.content && responseBody.content[0] && responseBody.content[0].text) {
          planContent = responseBody.content[0].text;
          console.log(`✅ Successfully used model: ${modelId}`);
          console.log('Plan content length:', planContent.length, 'characters');
          console.log('First 200 characters of plan:', planContent.substring(0, 200));
          break;
        } else {
          console.log('❌ Response structure unexpected:', JSON.stringify(responseBody, null, 2));
          throw new Error('Unexpected response structure from Bedrock');
        }
        
      } catch (error) {
        console.log(`❌ Failed with model ${modelId}:`);
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        console.log('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        
        lastError = error;
        continue;
      }
    }

    if (!planContent) {
      console.log('\n❌ All models failed, using fallback plan');
      console.log('Last error was:', lastError?.message);
      // Generate a comprehensive fallback plan based on user answers
      planContent = generateFallbackPlan(userAnswers);
    }

    // Parse the AI response and structure it
    const plan = {
      profile: userAnswers,
      plan: planContent.split('\n').filter(line => line.trim().length > 0)
    };

    console.log('✅ Final plan created successfully');
    console.log('Plan has', plan.plan.length, 'lines');
    console.log('=== AWS BEDROCK CALL END ===\n');

    res.json(plan);
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR in main try-catch:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // Fallback to mock data if Bedrock fails
    const userAnswers = req.body;
    const plan = {
      profile: userAnswers,
      plan: generateFallbackPlan(userAnswers).split('\n').filter(line => line.trim().length > 0)
    };
    
    console.log('✅ Fallback plan created due to error');
    res.json(plan);
  }
});

function generateFallbackPlan(userAnswers) {
  return `**Personalized Hypertrophy Plan for ${userAnswers.age} year old ${userAnswers.biologicalSex}**

**Training Program:**
Based on your ${userAnswers.experienceLevel} experience level and ${userAnswers.daysPerWeek} availability:

**Day 1: Upper Body Push**
- Bench Press: 3 sets x 8-12 reps (RIR: 2-3)
- Overhead Press: 3 sets x 8-12 reps (RIR: 2-3)
- Incline Dumbbell Press: 3 sets x 10-15 reps (RIR: 1-2)
- Lateral Raises: 3 sets x 12-15 reps (RIR: 1-2)
- Tricep Dips: 3 sets x 10-15 reps (RIR: 1-2)

**Day 2: Lower Body**
- Squats: 4 sets x 8-12 reps (RIR: 2-3)
- Romanian Deadlifts: 3 sets x 8-12 reps (RIR: 2-3)
- Leg Press: 3 sets x 10-15 reps (RIR: 1-2)
- Leg Extensions: 3 sets x 12-15 reps (RIR: 1-2)
- Calf Raises: 4 sets x 15-20 reps (RIR: 1-2)

**Day 3: Upper Body Pull**
- Barbell Rows: 3 sets x 8-12 reps (RIR: 2-3)
- Pull-ups/Assisted Pull-ups: 3 sets x 6-12 reps (RIR: 2-3)
- Lat Pulldowns: 3 sets x 10-15 reps (RIR: 1-2)
- Bicep Curls: 3 sets x 12-15 reps (RIR: 1-2)
- Face Pulls: 3 sets x 15-20 reps (RIR: 1-2)

**Progressive Overload Strategy:**
- Week 1-2: Focus on form and establishing baseline weights
- Week 3-4: Increase weight by 2.5-5 lbs when you can complete all sets with proper form
- Week 5-6: Add 1-2 reps to each set before increasing weight
- Week 7-8: Increase weight again and repeat cycle

**Nutrition Guidelines:**
- Protein: 1.6-2.2g per kg of body weight daily
- Carbohydrates: 3-7g per kg of body weight daily
- Fats: 0.8-1.2g per kg of body weight daily
- Total calories: ${userAnswers.weightGoal === 'Weight gain' ? 'Surplus of 300-500 calories' : userAnswers.weightGoal === 'Weight loss' ? 'Deficit of 300-500 calories' : 'Maintenance calories'}

**Recovery Protocols:**
- Sleep: 7-9 hours per night
- Rest days: 1-2 days between training sessions
- Stretching: 10-15 minutes post-workout
- Foam rolling: 5-10 minutes on rest days

**Progress Tracking:**
- Log all sets, reps, and weights
- Take progress photos monthly
- Measure body weight weekly
- Track how you feel and energy levels

**Safety Considerations:**
${userAnswers.injuries !== 'No' ? `- Modify exercises based on your injuries: ${userAnswers.injuries}` : '- Focus on proper form and controlled movements'}
- Warm up with 5-10 minutes of light cardio
- Start with lighter weights to establish form

**Motivation Strategy:**
Based on your ${userAnswers.coachingStyle} preference:
- Set specific, measurable goals
- Celebrate small wins
- Find a workout buddy or accountability partner
- Track progress to stay motivated`;
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Server IP Address: ${currentIP}`);
  console.log(`📱 Frontend should connect to: http://${currentIP}:${PORT}`);
  console.log(`🔍 Check server info at: http://${currentIP}:${PORT}/api/server-info`);
  console.log(`Make sure to update your .env file with real AWS credentials!`);
  console.log('Environment check:');
  console.log('- AWS_REGION:', process.env.AWS_REGION || 'NOT SET (defaulting to us-east-1)');
  console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
}); 