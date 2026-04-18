"""
PetHealth - A holistic health companion that mirrors, not judges.
Streamlit hackathon prototype implementing the spec template.
"""

import streamlit as st
from datetime import datetime, timedelta
import random

# ============================================================
# PAGE CONFIG
# ============================================================
st.set_page_config(
    page_title="PetHealth",
    page_icon="🫧",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ============================================================
# STYLING
# ============================================================
st.markdown("""
<style>
    .stApp {
        background: linear-gradient(180deg, #FFF8F0 0%, #F0F7FF 100%);
    }
    .pet-container {
        text-align: center;
        padding: 20px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 24px;
        margin: 10px 0;
    }
    .speech-bubble {
        background: white;
        border-radius: 20px;
        padding: 14px 18px;
        margin: 10px auto;
        max-width: 85%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        position: relative;
        font-style: italic;
        color: #444;
    }
    .stat-card {
        background: white;
        padding: 14px;
        border-radius: 14px;
        text-align: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .friend-card {
        background: white;
        padding: 14px;
        border-radius: 14px;
        margin: 8px 0;
        display: flex;
        align-items: center;
        box-shadow: 0 2px 6px rgba(0,0,0,0.06);
    }
    .vet-banner {
        background: linear-gradient(135deg, #FFE4E1 0%, #FFC9C9 100%);
        padding: 20px;
        border-radius: 16px;
        border-left: 5px solid #E74C3C;
        margin: 15px 0;
    }
    h1, h2, h3 { color: #2E75B6 !important; }
    .big-score {
        font-size: 48px;
        font-weight: 700;
        color: #2E75B6;
    }
</style>
""", unsafe_allow_html=True)

# ============================================================
# DATA: DIETARY RESTRICTIONS (from spec 2.1)
# ============================================================
DIETARY_OPTIONS = {
    "Vegetarian": "Hides meat-based menu suggestions",
    "Vegan": "Hides all animal products",
    "Gluten-free": "Flags wheat/barley/rye items",
    "Lactose intolerant": "Flags dairy-heavy items",
    "Nut allergy": "Flags tree nuts and peanuts",
    "Diabetes (Type 2)": "Prioritizes low-GI suggestions",
    "High blood pressure": "Flags high-sodium items",
    "Kidney condition": "Flags high-potassium/protein items",
    "Pregnant": "Flags raw fish, deli meat, high-mercury fish",
    "No restrictions": "Standard analysis",
}

SPECIES_OPTIONS = {
    "Slime": "🫧",
    "Cat": "🐱",
    "Dog": "🐶",
    "Dragon": "🐉",
}

# ============================================================
# DATA: HARDCODED SAMPLE STATE (from spec 2.2)
# ============================================================
def init_state():
    defaults = {
        "onboarded": False,
        "pet_name": "Mochi",
        "pet_species": "Slime",
        "dietary_restrictions": ["Vegetarian", "Gluten-free"],
        "goals": ["Eat better", "Sleep better"],
        "food_score": 70,
        "sleep_score": 45,
        "water_score": 80,
        "movement_score": 55,
        "stress_score": 70,
        "streak": 8,
        "longest_streak": 14,
        "evolution_stage": 2,
        "water_logged_oz": 44,
        "water_goal_oz": 64,
        "time_zone": "America/New_York",
        "screen": "Home",
        "meals_today": [
            {"time": "7:40 AM", "meal": "Oatmeal with berries and almonds", "impact": +8},
            {"time": "12:15 PM", "meal": "Turkey sandwich, side salad", "impact": +5},
            {"time": "3:30 PM", "meal": "Iced latte with oat milk", "impact": +1},
            {"time": "7:45 PM", "meal": "Cheese pizza, two slices", "impact": -4},
        ],
        "water_log": [
            {"time": "7:15 AM", "amount": "8 oz", "source": "Manual log"},
            {"time": "9:10 AM", "amount": "8 oz", "source": "Hourly reminder"},
            {"time": "10:45 AM", "amount": "8 oz", "source": "Manual log"},
            {"time": "12:30 PM", "amount": "12 oz", "source": "Manual log"},
            {"time": "2:00 PM", "amount": "8 oz", "source": "Hourly reminder"},
        ],
        "sleep_data": [
            {"night": "Mon", "duration": "7h 22m", "efficiency": 88, "tz": "ET", "impact": +6},
            {"night": "Tue", "duration": "6h 05m", "efficiency": 74, "tz": "ET", "impact": -2},
            {"night": "Wed", "duration": "8h 10m", "efficiency": 91, "tz": "ET", "impact": +9},
            {"night": "Thu", "duration": "5h 40m", "efficiency": 68, "tz": "PT (travel)", "impact": -5},
            {"night": "Fri", "duration": "6h 55m", "efficiency": 80, "tz": "PT", "impact": +2},
            {"night": "Sat", "duration": "7h 45m", "efficiency": 89, "tz": "PT", "impact": +7},
            {"night": "Sun", "duration": "5h 30m", "efficiency": 72, "tz": "ET (return)", "impact": -4},
        ],
        "friends": [
            {"name": "Alex R.", "pet": "Biscuit", "species": "🐶", "mood": "Thriving", "streak": 22},
            {"name": "Jordan M.", "pet": "Ember", "species": "🐉", "mood": "Healthy", "streak": 6},
            {"name": "Sam T.", "pet": "Pixel", "species": "🫧", "mood": "Sluggish", "streak": 2},
            {"name": "Casey L.", "pet": "Luna", "species": "🐱", "mood": "Unwell", "streak": 0},
            {"name": "Riley P.", "pet": "Tofu", "species": "🫧", "mood": "Thriving", "streak": 41},
        ],
        "menu_analyzed": False,
    }
    for k, v in defaults.items():
        if k not in st.session_state:
            st.session_state[k] = v

init_state()

# ============================================================
# SCORING (from spec 5.3)
# ============================================================
def overall_score():
    s = st.session_state
    return round(
        0.35 * s.food_score
        + 0.25 * s.sleep_score
        + 0.20 * s.water_score
        + 0.15 * s.movement_score
        + 0.05 * s.stress_score
    )

# ============================================================
# PET STATE (from spec 3.1)
# ============================================================
def pet_state():
    score = overall_score()
    if score >= 90: return ("Thriving", "#4CAF50", 1.0)
    if score >= 75: return ("Healthy", "#8BC34A", 0.9)
    if score >= 60: return ("Okay", "#FFC107", 0.75)
    if score >= 40: return ("Sluggish", "#FF9800", 0.55)
    if score >= 20: return ("Unwell", "#9E9E9E", 0.4)
    return ("Critical", "#757575", 0.3)

# ============================================================
# PET SVG RENDERER
# ============================================================
def render_pet():
    mood, color, saturation = pet_state()
    species = st.session_state.pet_species

    # Eye openness based on sleep (0.3 = droopy, 1.0 = wide open)
    eye_open = max(0.3, min(1.0, st.session_state.sleep_score / 100))

    # Bounce speed based on movement
    bounce_duration = 3.0 - (st.session_state.movement_score / 100) * 1.5

    # Texture cracks if dehydrated
    cracked = st.session_state.water_score < 50

    # Pale if food score low
    if st.session_state.food_score < 40:
        color = "#B0BEC5"

    eye_height = 12 * eye_open

    crack_svg = ""
    if cracked:
        crack_svg = '''
            <path d="M 90 120 Q 95 130 100 140" stroke="#888" stroke-width="1" fill="none" opacity="0.5"/>
            <path d="M 150 110 Q 155 125 160 135" stroke="#888" stroke-width="1" fill="none" opacity="0.5"/>
        '''

    sparkles = ""
    if mood in ["Thriving", "Healthy"]:
        sparkles = '''
            <circle cx="40" cy="60" r="3" fill="#FFD700" opacity="0.8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="210" cy="70" r="2" fill="#FFD700" opacity="0.8">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <circle cx="200" cy="160" r="3" fill="#FFD700" opacity="0.8">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="2.5s" repeatCount="indefinite"/>
            </circle>
        '''

    # Mouth based on mood
    if mood in ["Thriving", "Healthy"]:
        mouth = '<path d="M 110 155 Q 125 170 140 155" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    elif mood == "Okay":
        mouth = '<line x1="115" y1="158" x2="135" y2="158" stroke="#333" stroke-width="2.5" stroke-linecap="round"/>'
    else:
        mouth = '<path d="M 110 165 Q 125 155 140 165" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>'

    # Species-specific body
    if species == "Slime":
        body = f'''
            <ellipse cx="125" cy="150" rx="70" ry="55" fill="{color}" opacity="{saturation}">
                <animate attributeName="ry" values="55;58;55" dur="{bounce_duration}s" repeatCount="indefinite"/>
            </ellipse>
            <ellipse cx="105" cy="130" rx="15" ry="8" fill="white" opacity="0.4"/>
        '''
    elif species == "Cat":
        body = f'''
            <ellipse cx="125" cy="160" rx="60" ry="45" fill="{color}" opacity="{saturation}"/>
            <circle cx="125" cy="120" r="45" fill="{color}" opacity="{saturation}"/>
            <polygon points="90,85 100,105 110,95" fill="{color}" opacity="{saturation}"/>
            <polygon points="160,85 150,105 140,95" fill="{color}" opacity="{saturation}"/>
        '''
    elif species == "Dog":
        body = f'''
            <ellipse cx="125" cy="160" rx="65" ry="50" fill="{color}" opacity="{saturation}"/>
            <circle cx="125" cy="115" r="48" fill="{color}" opacity="{saturation}"/>
            <ellipse cx="85" cy="115" rx="12" ry="20" fill="{color}" opacity="{saturation}"/>
            <ellipse cx="165" cy="115" rx="12" ry="20" fill="{color}" opacity="{saturation}"/>
        '''
    else:  # Dragon
        body = f'''
            <ellipse cx="125" cy="160" rx="65" ry="50" fill="{color}" opacity="{saturation}"/>
            <circle cx="125" cy="115" r="45" fill="{color}" opacity="{saturation}"/>
            <polygon points="100,80 110,95 120,80" fill="{color}" opacity="{saturation}"/>
            <polygon points="130,80 140,95 150,80" fill="{color}" opacity="{saturation}"/>
            <polygon points="80,150 65,140 75,160" fill="{color}" opacity="{saturation}"/>
            <polygon points="170,150 185,140 175,160" fill="{color}" opacity="{saturation}"/>
        '''

    svg = f'''
    <svg viewBox="0 0 250 230" xmlns="http://www.w3.org/2000/svg" style="width: 240px; height: 220px;">
        {sparkles}
        {body}
        {crack_svg}
        <ellipse cx="108" cy="130" rx="5" ry="{eye_height/2}" fill="#333"/>
        <ellipse cx="142" cy="130" rx="5" ry="{eye_height/2}" fill="#333"/>
        {mouth}
    </svg>
    '''
    return svg

# ============================================================
# PET VOICE (from spec 4.2)
# ============================================================
def pet_voice():
    mood, _, _ = pet_state()
    s = st.session_state

    lines = []
    if s.sleep_score < 50:
        lines.append(f"I slept weird last night... a bit wobbly today.")
    if s.water_score < 50:
        lines.append("My skin feels dry... a glass of water would really help.")
    if s.food_score < 40:
        lines.append("Ooof, I feel a little heavy. Nothing we can't fix!")
    if s.streak >= 7:
        lines.append(f"We've been doing great for {s.streak} days. I'm really proud of us.")
    if mood == "Thriving":
        lines.append("I feel AMAZING today. Let's go do something fun!")
    if mood == "Critical":
        lines.append("I don't feel so good... can we talk to the vet?")
    if not lines:
        lines.append("Morning! What are we eating today?")

    return lines[0]

# ============================================================
# SCREEN: ONBOARDING (spec 2.1)
# ============================================================
def screen_onboarding():
    st.markdown("# 🫧 Welcome to PetHealth")
    st.markdown("*A companion that mirrors your wellbeing — no judgment, just empathy.*")
    st.markdown("---")

    st.markdown("### Step 1: Name your pet")
    name = st.text_input("What will you call your pet?", value="Mochi", max_chars=20)

    st.markdown("### Step 2: Pick a species")
    cols = st.columns(4)
    species = st.session_state.pet_species
    for i, (sp, emoji) in enumerate(SPECIES_OPTIONS.items()):
        with cols[i]:
            if st.button(f"{emoji}\n{sp}", key=f"sp_{sp}", use_container_width=True):
                species = sp
                st.session_state.pet_species = sp
    st.caption(f"Selected: **{species}** {SPECIES_OPTIONS[species]}")

    st.markdown("### Step 3: Dietary restrictions & conditions")
    st.caption("We'll tailor menu analysis to your profile.")
    selected = st.multiselect(
        "Select all that apply:",
        list(DIETARY_OPTIONS.keys()),
        default=st.session_state.dietary_restrictions,
    )
    if selected:
        with st.expander("How these affect your analysis"):
            for r in selected:
                st.markdown(f"• **{r}** — {DIETARY_OPTIONS[r]}")

    st.markdown("### Step 4: Goals (optional)")
    goals = st.multiselect(
        "What do you want to work on?",
        ["Eat better", "Sleep better", "Stay hydrated", "Move more", "Reduce stress"],
        default=st.session_state.goals,
    )

    st.markdown("---")
    if st.button("🚀 Meet my pet", use_container_width=True, type="primary"):
        st.session_state.pet_name = name
        st.session_state.pet_species = species
        st.session_state.dietary_restrictions = selected
        st.session_state.goals = goals
        st.session_state.onboarded = True
        st.session_state.screen = "Home"
        st.rerun()

# ============================================================
# SCREEN: HOME (spec 2.2)
# ============================================================
def screen_home():
    mood, color, _ = pet_state()
    score = overall_score()

    # Header with streak
    col1, col2 = st.columns([3, 1])
    with col1:
        st.markdown(f"### {st.session_state.pet_name}")
        st.caption(f"Feeling **{mood}**")
    with col2:
        st.markdown(f"<div style='text-align:right; font-size:20px;'>🔥 {st.session_state.streak} days</div>", unsafe_allow_html=True)

    # Pet display
    st.markdown(f"<div class='pet-container'>{render_pet()}</div>", unsafe_allow_html=True)

    # Speech bubble
    st.markdown(f"<div class='speech-bubble'>💬 {pet_voice()}</div>", unsafe_allow_html=True)

    # Critical state triggers vet visit banner
    if mood == "Critical":
        st.markdown("""
        <div class='vet-banner'>
            <strong>🏥 Vet Visit Available</strong><br>
            Your pet isn't feeling well. Let's build a gentle 3-day recovery plan together — no judgment.
        </div>
        """, unsafe_allow_html=True)
        if st.button("Start vet visit", use_container_width=True):
            st.info("🩺 **Vet:** Let's talk about what's been going on. No pressure — we'll find one small thing to focus on for the next 3 days.")

    # Health bar — 4 dimensions
    st.markdown("#### Today's wellbeing")
    c1, c2, c3, c4 = st.columns(4)
    dims = [
        ("🍎 Food", st.session_state.food_score, c1),
        ("😴 Sleep", st.session_state.sleep_score, c2),
        ("💧 Water", st.session_state.water_score, c3),
        ("🏃 Move", st.session_state.movement_score, c4),
    ]
    for label, val, col in dims:
        with col:
            st.markdown(f"<div class='stat-card'><div style='font-size:13px;'>{label}</div><div style='font-size:22px; font-weight:700; color:{color};'>{val}</div></div>", unsafe_allow_html=True)
            st.progress(val / 100)

    st.markdown(f"<div style='text-align:center; margin-top:15px;'><span class='big-score'>{score}</span><br><span style='color:#888;'>Overall wellbeing</span></div>", unsafe_allow_html=True)

    # Quick actions
    st.markdown("#### Quick actions")
    q1, q2, q3, q4 = st.columns(4)
    with q1:
        if st.button("🍽️ Meal", use_container_width=True):
            st.session_state.screen = "Meals"; st.rerun()
    with q2:
        if st.button("📷 Menu", use_container_width=True):
            st.session_state.screen = "Meals"; st.rerun()
    with q3:
        if st.button("💧 Water", use_container_width=True):
            st.session_state.screen = "Water"; st.rerun()
    with q4:
        if st.button("😴 Sleep", use_container_width=True):
            st.session_state.screen = "Sleep"; st.rerun()

# ============================================================
# SCREEN: MEALS & MENU (spec 2.3)
# ============================================================
def screen_meals():
    st.markdown("## 🍽️ Meals & Menu")

    tab1, tab2 = st.tabs(["Log meal", "Scan menu"])

    # --- Log meal ---
    with tab1:
        st.markdown("#### Today's meals")
        for m in st.session_state.meals_today:
            impact_color = "#4CAF50" if m["impact"] > 0 else "#E74C3C" if m["impact"] < 0 else "#888"
            sign = "+" if m["impact"] >= 0 else ""
            st.markdown(
                f"<div class='stat-card' style='text-align:left; margin:8px 0;'>"
                f"<b>{m['time']}</b> — {m['meal']}<br>"
                f"<span style='color:{impact_color};'>{sign}{m['impact']} impact</span>"
                f"</div>",
                unsafe_allow_html=True,
            )

        st.markdown("#### Log a new meal")
        new_meal = st.text_input("What did you eat?", placeholder="e.g., Grilled chicken salad")
        if st.button("Log meal", type="primary"):
            if new_meal:
                # Simple mock scoring
                good_words = ["salad", "grilled", "vegetable", "fruit", "quinoa", "salmon", "oat"]
                bad_words = ["fried", "pizza", "burger", "fries", "soda", "candy"]
                impact = 0
                lower = new_meal.lower()
                for w in good_words:
                    if w in lower: impact += 3
                for w in bad_words:
                    if w in lower: impact -= 3
                if impact == 0: impact = 1

                st.session_state.meals_today.append({
                    "time": datetime.now().strftime("%I:%M %p"),
                    "meal": new_meal,
                    "impact": impact,
                })
                st.session_state.food_score = max(0, min(100, st.session_state.food_score + impact))
                st.success(f"Logged! {st.session_state.pet_name} felt that ({'+' if impact>=0 else ''}{impact})")
                st.rerun()

    # --- Scan menu ---
    with tab2:
        st.markdown("#### Scan a menu")
        st.caption("Take a photo of a restaurant menu. We'll rank items based on your dietary profile.")

        uploaded = st.file_uploader("Upload menu photo", type=["png", "jpg", "jpeg"])
        if uploaded:
            st.image(uploaded, caption="Menu uploaded", use_container_width=True)

        if st.button("🔍 Analyze menu", type="primary", use_container_width=True):
            st.session_state.menu_analyzed = True

        if st.session_state.menu_analyzed:
            st.markdown("#### 🫧 Mochi's picks")
            st.caption(f"Based on your profile: {', '.join(st.session_state.dietary_restrictions)}")

            picks = [
                ("1", "Grilled salmon bowl with quinoa", "High protein, omega-3s, gluten-free. Mochi needs a sleep boost.", "#4CAF50"),
                ("2", "Mediterranean chickpea salad", "Fiber + plant protein, low sodium. Vegetarian-friendly.", "#8BC34A"),
                ("3", "Herb-roasted chicken with vegetables", "Lean protein, no heavy sauces. Good pick if you're hungry.", "#CDDC39"),
                ("Avoid", "Fettuccine alfredo", "Heavy cream, high saturated fat. Mochi would feel heavy tonight.", "#E74C3C"),
                ("Avoid", "Fried calamari appetizer", "Deep-fried, low nutrient density. Empty calories for Mochi.", "#E74C3C"),
            ]
            for rank, item, reason, c in picks:
                st.markdown(
                    f"<div class='stat-card' style='text-align:left; border-left:4px solid {c}; margin:8px 0;'>"
                    f"<b style='color:{c};'>{rank}</b> — <b>{item}</b><br>"
                    f"<span style='color:#555; font-style:italic;'>💬 {reason}</span>"
                    f"</div>",
                    unsafe_allow_html=True,
                )

# ============================================================
# SCREEN: SLEEP (spec 2.4)
# ============================================================
def screen_sleep():
    st.markdown("## 😴 Sleep")
    st.caption(f"Current time zone: **{st.session_state.time_zone}**")

    st.markdown("#### Last 7 nights")
    for n in st.session_state.sleep_data:
        impact_color = "#4CAF50" if n["impact"] > 0 else "#E74C3C"
        sign = "+" if n["impact"] >= 0 else ""
        bar_width = int(n["efficiency"])
        st.markdown(
            f"<div style='margin:6px 0;'>"
            f"<b>{n['night']}</b> — {n['duration']} · {n['efficiency']}% efficient · {n['tz']}"
            f"<span style='float:right; color:{impact_color};'>{sign}{n['impact']}</span>"
            f"<div style='background:#eee; border-radius:8px; height:10px; margin-top:4px;'>"
            f"<div style='background:#2E75B6; width:{bar_width}%; height:100%; border-radius:8px;'></div>"
            f"</div></div>",
            unsafe_allow_html=True,
        )

    st.markdown("---")
    st.markdown("#### Adjust last night (demo)")
    st.caption("Apple Watch sync is stubbed for prototype. Move the slider to see the pet react.")
    new_sleep = st.slider("Sleep score", 0, 100, st.session_state.sleep_score)
    if new_sleep != st.session_state.sleep_score:
        st.session_state.sleep_score = new_sleep
        st.rerun()

    st.markdown(f"<div class='speech-bubble'>💬 Let's aim for lights-out by 10:45 tonight — I'll feel so much better.</div>", unsafe_allow_html=True)

    # Time zone change notice
    if "travel" in str(st.session_state.sleep_data[-1].get("tz", "")) or "return" in str(st.session_state.sleep_data[-1].get("tz", "")):
        st.info("✈️ **Jet lag recovery:** Expect sleep quality to bounce back in ~2 nights.")

# ============================================================
# SCREEN: WATER (spec 2.5)
# ============================================================
def screen_water():
    st.markdown("## 💧 Water")

    logged = st.session_state.water_logged_oz
    goal = st.session_state.water_goal_oz
    pct = min(1.0, logged / goal)

    st.markdown(f"<div style='text-align:center;'><span class='big-score'>{logged} oz</span> / {goal} oz</div>", unsafe_allow_html=True)
    st.progress(pct)

    # Droplet row
    glasses = 8
    filled = min(glasses, logged // 8)
    droplets = "💧" * filled + "⚪" * (glasses - filled)
    st.markdown(f"<div style='text-align:center; font-size:28px; margin:15px 0;'>{droplets}</div>", unsafe_allow_html=True)

    # Next reminder
    now = datetime.now()
    next_reminder = (now + timedelta(minutes=60 - now.minute)).strftime("%I:%M %p")
    st.info(f"⏰ Next hourly reminder at **{next_reminder}**")

    c1, c2, c3 = st.columns(3)
    with c1:
        if st.button("+ 8 oz", use_container_width=True):
            st.session_state.water_logged_oz += 8
            st.session_state.water_score = min(100, st.session_state.water_score + 5)
            st.rerun()
    with c2:
        if st.button("+ 12 oz", use_container_width=True):
            st.session_state.water_logged_oz += 12
            st.session_state.water_score = min(100, st.session_state.water_score + 7)
            st.rerun()
    with c3:
        if st.button("+ 16 oz", use_container_width=True):
            st.session_state.water_logged_oz += 16
            st.session_state.water_score = min(100, st.session_state.water_score + 10)
            st.rerun()

    st.markdown("#### Today's log")
    for w in st.session_state.water_log:
        st.markdown(f"• **{w['time']}** — {w['amount']} _({w['source']})_")

    st.markdown("---")
    st.markdown("#### Settings")
    new_goal = st.slider("Daily goal (oz)", 48, 128, st.session_state.water_goal_oz, step=8)
    st.session_state.water_goal_oz = new_goal
    st.caption("Quiet hours: 10 PM – 7 AM (reminders paused)")

# ============================================================
# SCREEN: FRIENDS (spec 2.6)
# ============================================================
def screen_friends():
    st.markdown("## 👥 Friends")
    st.caption("See how your friends' pets are doing. A sick pet is visible — gentle accountability, no calorie counts.")

    mood_colors = {
        "Thriving": "#4CAF50",
        "Healthy": "#8BC34A",
        "Okay": "#FFC107",
        "Sluggish": "#FF9800",
        "Unwell": "#9E9E9E",
        "Critical": "#757575",
    }

    for f in st.session_state.friends:
        c = mood_colors.get(f["mood"], "#888")
        can_playdate = f["mood"] in ["Thriving", "Healthy"]
        my_mood, _, _ = pet_state()
        i_can_playdate = my_mood in ["Thriving", "Healthy"]

        st.markdown(
            f"<div class='friend-card'>"
            f"<div style='font-size:36px; margin-right:15px;'>{f['species']}</div>"
            f"<div style='flex:1;'>"
            f"<b>{f['name']}</b> · {f['pet']}<br>"
            f"<span style='color:{c};'>● {f['mood']}</span> · 🔥 {f['streak']} days"
            f"</div>"
            f"</div>",
            unsafe_allow_html=True,
        )
        if can_playdate and i_can_playdate:
            if st.button(f"🎉 Invite {f['pet']} to a playdate", key=f"pd_{f['name']}"):
                st.success(f"{st.session_state.pet_name} and {f['pet']} are playing! Both pets got a small wellbeing boost.")

    st.markdown("---")
    st.text_input("Add a friend by username", placeholder="@username")

# ============================================================
# SCREEN: SETTINGS / DEV
# ============================================================
def screen_settings():
    st.markdown("## ⚙️ Settings & Demo Controls")

    st.markdown("#### Profile")
    st.write(f"**Pet:** {st.session_state.pet_name} ({st.session_state.pet_species})")
    st.write(f"**Restrictions:** {', '.join(st.session_state.dietary_restrictions) or 'None'}")
    st.write(f"**Goals:** {', '.join(st.session_state.goals) or 'None'}")

    if st.button("🔄 Re-do onboarding"):
        st.session_state.onboarded = False
        st.rerun()

    st.markdown("---")
    st.markdown("#### Demo: Adjust all health dimensions")
    st.caption("For demo purposes — watch the pet react in real time.")

    st.session_state.food_score = st.slider("🍎 Food", 0, 100, st.session_state.food_score)
    st.session_state.sleep_score = st.slider("😴 Sleep", 0, 100, st.session_state.sleep_score)
    st.session_state.water_score = st.slider("💧 Water", 0, 100, st.session_state.water_score)
    st.session_state.movement_score = st.slider("🏃 Movement", 0, 100, st.session_state.movement_score)
    st.session_state.stress_score = st.slider("😌 Calm (inverse stress)", 0, 100, st.session_state.stress_score)

    st.markdown("---")
    st.markdown("#### Evolution stage")
    stages = ["🥚 Egg", "👶 Baby", "🧒 Teen", "🧑 Adult", "✨ Legendary"]
    st.write(f"Current: **{stages[st.session_state.evolution_stage - 1]}** (Stage {st.session_state.evolution_stage} of 5)")
    st.caption("Stages unlock at 3 days, 30 days, 90 days, and 365 days of Healthy+ state.")

# ============================================================
# NAVIGATION
# ============================================================
def main():
    if not st.session_state.onboarded:
        screen_onboarding()
        return

    # Top bar
    st.markdown(f"<h1 style='text-align:center; margin-bottom:0;'>🫧 PetHealth</h1>", unsafe_allow_html=True)

    # Nav tabs
    screens = {
        "Home": screen_home,
        "Meals": screen_meals,
        "Sleep": screen_sleep,
        "Water": screen_water,
        "Friends": screen_friends,
        "Settings": screen_settings,
    }

    cols = st.columns(len(screens))
    for i, name in enumerate(screens.keys()):
        with cols[i]:
            is_current = st.session_state.screen == name
            label = f"**{name}**" if is_current else name
            if st.button(label, key=f"nav_{name}", use_container_width=True):
                st.session_state.screen = name
                st.rerun()

    st.markdown("---")
    screens[st.session_state.screen]()

if __name__ == "__main__":
    main()
