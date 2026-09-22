"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck, Globe, User, Mail, X, Loader2, ChevronDown, History, CheckCircle, Database } from "lucide-react";

export default function Dashboard() {
  const [violations, setViolations] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);
  
  const [modalConfig, setModalConfig] = useState<{ title: string; type: string; message: string; officers?: any[] } | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [successMsg, setSuccessMsg] = useState(false);

  const [activeScenario, setActiveScenario] = useState("transit_bus_gps");

  // COMPREHENSIVE MUNICIPAL DATA STREAMS (50+ Scenarios)
  const scenarios: Record<string, any[]> = {
    // --- TRANSIT & TRAFFIC (Compliant & Low Risk) ---
    transit_bus_gps: [{ event_id: "TRN-101", sensor_type: "Fleet_GPS", data_collected: "Public bus route coordinates", retention_days: 1, pii_collected: false }],
    traffic_speed_radar: [{ event_id: "TRN-102", sensor_type: "Speed_Radar", data_collected: "Vehicle speeds without plates", retention_days: 7, pii_collected: false }],
    metro_turnstile_count: [{ event_id: "TRN-103", sensor_type: "Turnstile_Sensor", data_collected: "Hourly station footfall totals", retention_days: 14, pii_collected: false }],
    bike_share_ping: [{ event_id: "TRN-104", sensor_type: "Docking_Station", data_collected: "Bicycle availability logs", retention_days: 3, pii_collected: false }],
    bridge_toll_rfid: [{ event_id: "TRN-105", sensor_type: "Toll_Reader", data_collected: "Encrypted transponder tokens", retention_days: 30, pii_collected: false }],
    ev_charging_station: [{ event_id: "TRN-106", sensor_type: "Charger_Telemetry", data_collected: "Power draw and duration", retention_days: 15, pii_collected: false }],
    parking_meter_occupancy: [{ event_id: "TRN-107", sensor_type: "Pavement_Sensor", data_collected: "Bay vacant/occupied states", retention_days: 5, pii_collected: false }],
    pedestrian_counter: [{ event_id: "TRN-108", sensor_type: "Thermal_Sensor", data_collected: "Anonymous pedestrian heatmaps", retention_days: 2, pii_collected: false }],
    freight_weight_scale: [{ event_id: "TRN-109", sensor_type: "Weigh_Station", data_collected: "Commercial truck axles", retention_days: 30, pii_collected: false }],
    traffic_light_timing: [{ event_id: "TRN-110", sensor_type: "Loop_Detector", data_collected: "Queue length metrics", retention_days: 1, pii_collected: false }],

    // --- PUBLIC SAFETY & SURVEILLANCE (High Violations) ---
    cctv_facial_rec: [{ event_id: "SAF-201", sensor_type: "CCTV_Facial_Rec", data_collected: "Biometric face scans & vector embeddings", retention_days: 365, pii_collected: true }],
    automatic_plate_reader: [{ event_id: "SAF-202", sensor_type: "ANPR_Camera", data_collected: "Driver faces and license plates", retention_days: 180, pii_collected: true }],
    police_body_cam: [{ event_id: "SAF-203", sensor_type: "BodyWorn_Camera", data_collected: "Unfiltered public audio/video feeds", retention_days: 400, pii_collected: true }],
    drone_thermal_patrol: [{ event_id: "SAF-204", sensor_type: "Municipal_Drone", data_collected: "Backyard aerial surveillance logs", retention_days: 90, pii_collected: true }],
    shotspotter_audio: [{ event_id: "SAF-205", sensor_type: "Acoustic_Sensor", data_collected: "Continuous street audio monitoring", retention_days: 60, pii_collected: true }],
    subway_undercover_cam: [{ event_id: "SAF-206", sensor_type: "Platform_CCTV", data_collected: "Biometric crowd profiling", retention_days: 120, pii_collected: true }],
    school_zone_speed_cam: [{ event_id: "SAF-207", sensor_type: "Speed_Camera", data_collected: "Driver facial imagery capture", retention_days: 90, pii_collected: true }],
    public_housing_surveillance: [{ event_id: "SAF-208", sensor_type: "Entrance_CCTV", data_collected: "Resident facial logs & visitor tracking", retention_days: 180, pii_collected: true }],
    facial_emotion_analyzer: [{ event_id: "SAF-209", sensor_type: "AI_Camera", data_collected: "Citizen emotional state analysis", retention_days: 45, pii_collected: true }],
    jail_visitor_biometrics: [{ event_id: "SAF-210", sensor_type: "Biometric_Gate", data_collected: "Visitor retinal and facial prints", retention_days: 365, pii_collected: true }],

    // --- PUBLIC WI-FI & DIGITAL TELEMETRY (Medium/High Violations) ---
    public_wifi_mac: [{ event_id: "NET-301", sensor_type: "Public_WiFi_Router", data_collected: "Citizen MAC Addresses & Location History", retention_days: 90, pii_collected: true }],
    library_browser_logs: [{ event_id: "NET-302", sensor_type: "Public_Terminal", data_collected: "User browsing history & search queries", retention_days: 180, pii_collected: true }],
    smart_bench_tracker: [{ event_id: "NET-303", sensor_type: "IoT_Bench", data_collected: "Bluetooth beacon device sniffing", retention_days: 60, pii_collected: true }],
    city_app_location: [{ event_id: "NET-304", sensor_type: "Municipal_App", data_collected: "Real-time user GPS background tracking", retention_days: 365, pii_collected: true }],
    public_kiosk_id: [{ event_id: "NET-305", sensor_type: "Wayfinding_Kiosk", data_collected: "User credit card metadata & touch logs", retention_days: 90, pii_collected: true }],
    free_hotspot_login: [{ event_id: "NET-306", sensor_type: "Hotspot_Gateway", data_collected: "Social media login token harvesting", retention_days: 120, pii_collected: true }],
    bluetooth_beacon_mall: [{ event_id: "NET-307", sensor_type: "Beacon_Array", data_collected: "Shopper proximity tracking IDs", retention_days: 30, pii_collected: true }],
    park_free_wifi: [{ event_id: "NET-308", sensor_type: "Park_Router", data_collected: "Device MAC logging without consent", retention_days: 45, pii_collected: true }],
    municipal_dns_sinkhole: [{ event_id: "NET-309", sensor_type: "DNS_Gateway", data_collected: "Citizen domain request histories", retention_days: 90, pii_collected: true }],
    smart_pole_rfid: [{ event_id: "NET-310", sensor_type: "Smart_Pole", data_collected: "RFID tag tracking of pedestrians", retention_days: 60, pii_collected: true }],

    // --- SMART UTILITIES & ENVIRONMENT (Compliant) ---
    smart_water_meter: [{ event_id: "ENV-401", sensor_type: "Water_Telemetry", data_collected: "Hourly flow volume consumption", retention_days: 30, pii_collected: false }],
    smart_grid_electric: [{ event_id: "ENV-402", sensor_type: "Power_Meter", data_collected: "Block-level power consumption", retention_days: 30, pii_collected: false }],
    air_quality_sensor: [{ event_id: "ENV-403", sensor_type: "AQI_Monitor", data_collected: "CO2 and particulate matter levels", retention_days: 14, pii_collected: false }],
    weather_station_array: [{ event_id: "ENV-404", sensor_type: "Meteorology", data_collected: "Temperature, humidity, wind speed", retention_days: 7, pii_collected: false }],
    noise_pollution_mic: [{ event_id: "ENV-405", sensor_type: "Decibel_Meter", data_collected: "Neighborhood decibel averages", retention_days: 5, pii_collected: false }],
    street_light_sensor: [{ event_id: "ENV-406", sensor_type: "Photocell", data_collected: "Ambient lumen levels", retention_days: 3, pii_collected: false }],
    flood_water_gauge: [{ event_id: "ENV-407", sensor_type: "Sonar_Sensor", data_collected: "River and canal water heights", retention_days: 14, pii_collected: false }],
    sewer_flow_monitor: [{ event_id: "ENV-408", sensor_type: "Pipeline_Sensor", data_collected: "Waste volume metrics", retention_days: 10, pii_collected: false }],
    soil_moisture_park: [{ event_id: "ENV-409", sensor_type: "Irrigation_Sensor", data_collected: "Park soil hydration levels", retention_days: 5, pii_collected: false }],
    solar_panel_array: [{ event_id: "ENV-410", sensor_type: "Solar_Inverter", data_collected: "Energy generation output", retention_days: 30, pii_collected: false }],

    // --- HEALTH, SANITATION & MUNICIPAL SERVICES ---
    hospital_er_triage: [{ event_id: "HLT-501", sensor_type: "ER_Gateway", data_collected: "Anonymized emergency room wait times", retention_days: 7, pii_collected: false }],
    waste_bin_fill_sensor: [{ event_id: "HLT-502", sensor_type: "Bin_Sonar", data_collected: "Dumpster capacity levels", retention_days: 3, pii_collected: false }],
    public_pool_chlorine: [{ event_id: "HLT-503", sensor_type: "Water_Quality", data_collected: "Pool pH and sanitizer levels", retention_days: 5, pii_collected: false }],
    stadium_crowd_density: [{ event_id: "HLT-504", sensor_type: "IR_Sensor", data_collected: "Concourse crowd congestion metrics", retention_days: 1, pii_collected: false }],
    recreation_center_checkin: [{ event_id: "HLT-505", sensor_type: "RFID_Scanner", data_collected: "Member attendance timestamps", retention_days: 30, pii_collected: false }],
    public_restroom_occupancy: [{ event_id: "HLT-506", sensor_type: "Door_Sensor", data_collected: "Stall availability counts", retention_days: 1, pii_collected: false }],
    animal_shelter_tracker: [{ event_id: "HLT-507", sensor_type: "Pet_Microchip", data_collected: "Stray intake logs", retention_days: 90, pii_collected: false }],
    cemetery_digital_map: [{ event_id: "HLT-508", sensor_type: "GIS_Mapping", data_collected: "Plot coordinates", retention_days: 365, pii_collected: false }],
    library_book_rfid: [{ event_id: "HLT-509", sensor_type: "Book_Scanner", data_collected: "Circulation records", retention_days: 14, pii_collected: false }],
    fire_station_dispatch: [{ event_id: "HLT-510", sensor_type: "Dispatch_Log", data_collected: "Emergency truck rollout times", retention_days: 30, pii_collected: false }]
  };

  const runAudit = async () => {
    setLoading(true);
    setViolations(null);
    try {
      const response = await fetch("http://localhost:8000/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: scenarios[activeScenario] }),
      });
      const data = await response.json();
      setViolations(data.violations);
    } catch (error) {
      console.error("Audit failed", error);
    }
    setLoading(false);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/history");
      const data = await res.json();
      setAuditHistory(data.history || []);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error("Failed to load history", err);
    }
  };

  const handleDatabaseAction = async (actionType: string) => {
    try {
      await fetch("http://localhost:8000/api/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action_type: actionType, details: inputVal || "Default configuration applied" }),
      });
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setModalConfig(null);
        setInputVal("");
      }, 1500);
    } catch (err) {
      console.error("Failed to save action", err);
    }
  };

  return (
    <main className="min-h-screen bg-cover bg-center relative flex flex-col" style={{ backgroundImage: "url('/background.jpg')" }}>
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>

      {/* TOP NAVIGATION BAR */}
      <nav className="relative z-10 w-full bg-black/60 flex justify-between items-center px-10 py-4 border-b border-white/5">
        {/* Updated Logo Box */}
        <div onClick={() => window.location.reload()} className="border-2 border-white p-1 text-white text-[10px] font-extrabold flex flex-col items-center w-11 tracking-tighter cursor-pointer hover:bg-white hover:text-black transition">
          <span>AUD</span>
          <span>IT</span>
        </div>

        <ul className="hidden md:flex gap-8 text-white text-[10px] font-bold tracking-widest uppercase">
          <li onClick={() => window.location.reload()} className="hover:text-gray-300 cursor-pointer transition">Home</li>
          <li onClick={() => setModalConfig({ title: "Services API Manager", type: "services", message: "Configure municipal streaming data connectors." })} className="hover:text-gray-300 cursor-pointer transition">Services</li>
          <li onClick={fetchHistory} className="hover:text-gray-300 cursor-pointer transition flex items-center gap-1 text-yellow-400">
            <History className="w-3 h-3" /> Works (Audit History)
          </li>
          <li onClick={() => setModalConfig({ title: "About Platform", type: "about", message: "Civic Surveillance Auditor built for LexHack 2026. Scalable RAG compliance engine." })} className="hover:text-gray-300 cursor-pointer transition">About</li>
          <li onClick={() => setModalConfig({ title: "Policy Blog", type: "blog", message: "Regulatory updates on municipal telemetry compliance." })} className="hover:text-gray-300 cursor-pointer transition">Blog</li>
          <li onClick={() => setModalConfig({ 
            title: "Municipal Digital Rights Board", 
            type: "contact_directory", 
            message: "Official Oversight & Compliance Contacts:",
            officers: [
              { name: "Dr. Aris Thorne", title: "Chief Privacy Officer", email: "a.thorne@civicaudit.gov", ext: "Ext: 4021" },
              { name: "Priya Sharma", title: "Municipal Data Inspector", email: "p.sharma@civicaudit.gov", ext: "Ext: 4025" },
              { name: "Cyber Incident Hotline", title: "Emergency Breach Response", email: "hotline@civicaudit.gov", ext: "+1 (800) 555-PRIV" }
            ]
          })} className="hover:text-gray-300 cursor-pointer transition">Contact</li>
        </ul>

        {/* Interactive Icons Connected to DB Actions */}
        <div className="flex gap-5 text-white">
          <Globe onClick={() => setModalConfig({ title: "Global RAG Settings", type: "globe", message: "Set active municipal legal framework jurisdiction:" })} className="w-4 h-4 cursor-pointer hover:text-gray-300 transition" />
          <User onClick={() => setModalConfig({ title: "Oversight Officer Login", type: "user", message: "Enter officer badge ID to authenticate session:" })} className="w-4 h-4 cursor-pointer hover:text-gray-300 transition" />
          <Mail onClick={() => setModalConfig({ title: "Automated Breach Alerts", type: "mail", message: "Subscribe official email for real-time violation dispatches:" })} className="w-4 h-4 cursor-pointer hover:text-gray-300 transition" />
        </div>
      </nav>

      {/* CENTER HERO SECTION */}
      <div className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 text-center pb-20">
        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-widest uppercase mb-4 drop-shadow-lg">
          Civic Audit
        </h1>
        <p className="text-gray-200 text-sm md:text-base max-w-2xl mb-8 tracking-wide drop-shadow-md font-light">
          Real-time monitoring of municipal data collection. AI-powered auditing against digital rights laws to protect citizen privacy.
        </p>

        {/* Scaled 50+ Scenario Dropdown */}
        <div className="mb-8 relative flex items-center justify-center">
          <span className="text-white text-xs font-bold tracking-widest uppercase mr-4 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-yellow-400" /> Data Source ({Object.keys(scenarios).length} Streams):
          </span>
          <div className="relative">
            <select 
              value={activeScenario}
              onChange={(e) => setActiveScenario(e.target.value)}
              className="appearance-none bg-black/70 border border-white/30 text-white text-xs font-bold tracking-widest uppercase py-3 pl-4 pr-10 rounded-none focus:outline-none focus:border-white cursor-pointer transition backdrop-blur-md max-w-[320px]"
            >
              <optgroup label="Transit & Traffic (Compliant)">
                <option value="transit_bus_gps">TRN-101: Fleet GPS Coordinates</option>
                <option value="traffic_speed_radar">TRN-102: Speed Radar Logs</option>
                <option value="metro_turnstile_count">TRN-103: Turnstile Footfall Totals</option>
                <option value="bike_share_ping">TRN-104: Bike Share Pings</option>
                <option value="bridge_toll_rfid">TRN-105: Bridge Toll RFID</option>
                <option value="ev_charging_station">TRN-106: EV Charging Telemetry</option>
                <option value="parking_meter_occupancy">TRN-107: Parking Bay Occupancy</option>
                <option value="pedestrian_counter">TRN-108: Thermal Pedestrian Counter</option>
                <option value="freight_weight_scale">TRN-109: Freight Weight Scales</option>
                <option value="traffic_light_timing">TRN-110: Traffic Loop Detectors</option>
              </optgroup>

              <optgroup label="Public Safety & Surveillance (High Risk)">
                <option value="cctv_facial_rec">SAF-201: CCTV Facial Recognition</option>
                <option value="automatic_plate_reader">SAF-202: Automatic Plate Readers</option>
                <option value="police_body_cam">SAF-203: Police Body-Worn Cameras</option>
                <option value="drone_thermal_patrol">SAF-204: Municipal Drone Patrols</option>
                <option value="shotspotter_audio">SAF-205: Acoustic Gunshot Sensors</option>
                <option value="subway_undercover_cam">SAF-206: Subway Platform Biometrics</option>
                <option value="school_zone_speed_cam">SAF-207: School Zone Facial Scans</option>
                <option value="public_housing_surveillance">SAF-208: Public Housing Entrance CCTV</option>
                <option value="facial_emotion_analyzer">SAF-209: AI Emotion Analyzers</option>
                <option value="jail_visitor_biometrics">SAF-210: Detention Visitor Retinal Scans</option>
              </optgroup>

              <optgroup label="Public Wi-Fi & Digital Telemetry (Medium/High)">
                <option value="public_wifi_mac">NET-301: Public Wi-Fi MAC Logs</option>
                <option value="library_browser_logs">NET-302: Public Library Search History</option>
                <option value="smart_bench_tracker">NET-303: IoT Smart Bench Bluetooth</option>
                <option value="city_app_location">NET-304: Municipal App Background GPS</option>
                <option value="public_kiosk_id">NET-305: Wayfinding Kiosk Touch Logs</option>
                <option value="free_hotspot_login">NET-306: Hotspot Social Token Harvest</option>
                <option value="bluetooth_beacon_mall">NET-307: Downtown Beacon Sniffing</option>
                <option value="park_free_wifi">NET-308: Park Hotspot MAC Retain</option>
                <option value="municipal_dns_sinkhole">NET-309: Municipal DNS Domain Logs</option>
                <option value="smart_pole_rfid">NET-310: Smart Pole RFID Scans</option>
              </optgroup>

              <optgroup label="Smart Utilities & Environment (Compliant)">
                <option value="smart_water_meter">ENV-401: Smart Water Meters</option>
                <option value="smart_grid_electric">ENV-402: Smart Grid Electricity</option>
                <option value="air_quality_sensor">ENV-403: AQI Particulate Monitors</option>
                <option value="weather_station_array">ENV-404: Meteorology Weather Arrays</option>
                <option value="noise_pollution_mic">ENV-405: Noise Pollution Decibels</option>
                <option value="street_light_sensor">ENV-406: Street Light Photocells</option>
                <option value="flood_water_gauge">ENV-407: Flood & Canal Gauges</option>
                <option value="sewer_flow_monitor">ENV-408: Pipeline Sewer Volume</option>
                <option value="soil_moisture_park">ENV-409: Park Soil Hydration</option>
                <option value="solar_panel_array">ENV-410: Solar Grid Inverters</option>
              </optgroup>

              <optgroup label="Health, Sanitation & Services">
                <option value="hospital_er_triage">HLT-501: Hospital ER Wait Times</option>
                <option value="waste_bin_fill_sensor">HLT-502: Waste Bin Sonar Levels</option>
                <option value="public_pool_chlorine">HLT-503: Public Pool Chlorine Logs</option>
                <option value="stadium_crowd_density">HLT-504: Stadium Crowd Density</option>
                <option value="recreation_center_checkin">HLT-505: Rec Center RFID Check-ins</option>
                <option value="public_restroom_occupancy">HLT-506: Restroom Stall Sensors</option>
                <option value="animal_shelter_tracker">HLT-507: Animal Microchip Logs</option>
                <option value="cemetery_digital_map">HLT-508: GIS Cemetery Plot Maps</option>
                <option value="library_book_rfid">HLT-509: Library Circulation RFID</option>
                <option value="fire_station_dispatch">HLT-510: Fire Station Dispatch Times</option>
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-white absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="flex gap-4 mb-12">
          <button
            onClick={runAudit}
            disabled={loading}
            className="border-2 border-white text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition duration-300 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[160px]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Auditing..." : "Run Audit"}
          </button>
          
          <button 
            onClick={() => setIsLogsModalOpen(true)}
            className="bg-white text-black px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition duration-300 min-w-[160px]"
          >
            View Logs
          </button>
        </div>

        {violations && (
          <div className="w-full max-w-3xl bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-8 text-left animate-in fade-in duration-500 shadow-2xl">
            {violations.length === 0 ? (
              <div className="flex items-start gap-4">
                <ShieldCheck className="text-green-400 h-8 w-8" />
                <div>
                  <h2 className="text-green-400 font-bold text-xl uppercase tracking-widest">Fully Compliant</h2>
                  <p className="text-gray-300 mt-1 font-light">No digital rights violations detected in this municipal stream.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white uppercase tracking-widest border-b border-white/20 pb-2 mb-4">
                  Privacy Violations Detected
                </h2>
                {violations.map((violation, idx) => (
                  <div key={idx} className="bg-[#111] border border-red-500/40 rounded-md p-5 flex items-start gap-4 shadow-inner">
                    <AlertTriangle className="text-red-500 h-6 w-6 mt-1 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-bold tracking-wide">{violation.event_id}</h3>
                        <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          {violation.severity_level}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm font-light leading-relaxed">{violation.violation_reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {modalConfig && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-black/90 border border-white/20 w-full max-w-md rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h2 className="text-white font-bold tracking-widest uppercase text-xs">{modalConfig.title}</h2>
              <button onClick={() => setModalConfig(null)} className="text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-6 text-center space-y-4">
              <p className="text-gray-300 text-xs font-light leading-relaxed">{modalConfig.message}</p>
              
              {modalConfig.type === "contact_directory" && modalConfig.officers && (
                <div className="space-y-3 text-left my-2">
                  {modalConfig.officers.map((off, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 p-3 rounded">
                      <div className="text-white font-bold text-xs">{off.name} <span className="text-gray-400 font-normal">({off.title})</span></div>
                      <div className="text-yellow-400 text-[10px] font-mono mt-1">{off.email} | {off.ext}</div>
                    </div>
                  ))}
                </div>
              )}

              {["globe", "user", "mail", "services"].includes(modalConfig.type) && (
                <input 
                  type="text" 
                  placeholder="Enter configuration value..."
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-full bg-black/50 border border-white/30 text-white text-xs px-3 py-2 rounded focus:outline-none focus:border-white"
                />
              )}

              {successMsg ? (
                <div className="flex items-center justify-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest py-2">
                  <CheckCircle className="w-4 h-4" /> Successfully Saved to DB!
                </div>
              ) : (
                ["globe", "user", "mail", "services"].includes(modalConfig.type) && (
                  <button 
                    onClick={() => handleDatabaseAction(modalConfig.type.toUpperCase())}
                    className="w-full bg-white text-black py-2 text-xs font-bold tracking-widest uppercase hover:bg-gray-200 transition"
                  >
                    Save & Commit to DB
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0e0e0e] border border-gray-700 w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#141414]">
              <h2 className="text-white font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                <History className="w-4 h-4 text-yellow-400" /> Immutable Database Audit History (SQLite)
              </h2>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-auto max-h-[60vh] space-y-3">
              {auditHistory.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-6">No audits recorded in the database yet.</p>
              ) : (
                auditHistory.map((item, i) => (
                  <div key={i} className="border border-white/10 bg-black/60 p-3 rounded flex justify-between items-start gap-4 text-xs font-mono">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-400">{item.timestamp}</span>
                        <span className="text-white font-bold">[{item.event_id}]</span>
                      </div>
                      <p className="text-gray-300 font-sans text-xs">{item.violation_reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isLogsModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-gray-700 w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-[#111]">
              <h2 className="text-white font-bold tracking-widest uppercase text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" /> Raw Database Logs ({activeScenario})
              </h2>
              <button onClick={() => setIsLogsModalOpen(false)} className="text-gray-400 hover:text-white transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-auto max-h-[60vh]">
              <pre className="text-green-500 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(scenarios[activeScenario], null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}