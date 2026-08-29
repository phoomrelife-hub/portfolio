// Single source of truth for all portfolio copy/data.
// Every placeholder is prefixed "[TODO: ...]" — grep for "\[TODO" to find what's left to fill in.

export const profile = {
  name: "ภูมิ",
  fullName: "Nutchanon Chalermsopon",
  position: "Intern - Dev",
  dateRange: "16 เมษายน - 31 สิงหาคม",
  bio: {
    start:
      "ผมเริ่มต้นจาก 0 ไม่เคยมีพื้นฐานการทำเว็บหรือการทำระบบมาก่อน มีเพียงความสนใจใน AI แต่ในตอนนั้นไม่กล้าพูดกับใคร มีเพียงไฟที่แรงกล้า และต้องเรียนรู้เรื่อง Technology ตั้งแต่ต้น",
    growth:
      "กลายเป็นเด็กที่สามารถสร้างระบบได้ ตัดสินใจได้เองในหลายๆ เรื่อง หาวิธีจัดการกับงานที่ได้รับ บางงานก็ง่าย บางงานก็ยาก บางงานมีเทคนิคเยอะน้อยต่างกันไป จนได้รับคำชมจากพี่ๆ มากมาย ในระยะเวลา 4 เดือนนี้ ภูมิรู้สึกว่าตัวเองโตขึ้นเร็วมาก จนเป้าหมายของภูมิขยายตามไปด้วย ฝันของภูมิกล้าใหญ่ขึ้นเรื่อยๆ ตามสกิลที่เพิ่มขึ้น และภูมิเชื่อในตัวเองว่าผมสามารถทำได้ครับ",
  },
};

// ---------------------------------------------------------------------------
// 02 — หน้าที่ (Stardew-Valley-style dialogue scene, two rounds)
// ---------------------------------------------------------------------------
export type DialogueLine = { speaker: "user" | "phum"; text: string };

export const roleScene = {
  normalRound: {
    opening: { speaker: "user", text: "ภูมิ พี่อยากได้อันนี้อะ ระบบนี้" } as DialogueLine,
    accept: { speaker: "phum", text: "ได้ครับพี่" } as DialogueLine,
    exchange: [
      { speaker: "user", text: "บลาๆๆ......" },
      { speaker: "phum", text: "บลาๆๆ...... ครับ" },
    ] as DialogueLine[],
    closing: { speaker: "phum", text: "โอเคครับ เดี๋ยวถ้ามีอะไรเพิ่มเติมเดี๋ยวผมทักหาพี่นะ" } as DialogueLine,
    callResolution: { speaker: "phum", text: "เสร็จแล้วนะครับพี่ ลองใช้ได้เลยครับ" } as DialogueLine,
    userThanks: { speaker: "user", text: "โอเคภูมิ ขอบคุณมาก" } as DialogueLine,
  },
  overloadRound: {
    tiredLine: "เสร็จแล้ว....",
  },
  article: [
    "ภูมิใช้สกิลและเทคนิคที่เรียนมา เพื่อตอบโจทย์ปัญหาต่างๆ ในบริษัทที่เจอได้อย่างเหมาะสม เช่น dashboard ที่ขึ้นจอ โดยดึงข้อมูลจากระบบ Pancake หรือ Google Sheet หรือการตอบแชทแทนฝ่าย HR โดยใช้ Openclaw ซึ่งภูมิจะทำระบบโดยที่ user ไม่ต้องรู้ว่าเบื้องหลังทำงานยังไง เน้นให้ user รู้สึกว่าใช้งานง่าย แค่กดปุ่มสองปุ่มก็จบ",
    "ภูมิใช้ AI ช่วยทำงานเป็นหลัก เช่น Claude Code / Codex แต่คนที่วางแผนและกำหนดทิศทางคือภูมิเอง ตั้งแต่ออกแบบระบบว่าควรเป็นแบบไหน จะนำข้อมูลเข้ามาจากไหน หา source ต่างๆ ก่อน วางแผน brainstorm ขัด requirement ให้ชัดเจน จัดลำดับว่าอะไรควรทำก่อนหลัง ส่งมอบให้ user ได้ใช้จริงเพื่อเก็บ feedback แล้วพัฒนาระบบต่อไปทุกวัน เมื่อมีปัญหาใหม่เกิดขึ้นก็ต้องมีระบบมารองรับปัญหานั้นด้วยครับ",
  ] as string[],
};

// ---------------------------------------------------------------------------
// 04 — งานที่ทำ (reuses workItems as the task-board data feeding the room scene)
// ---------------------------------------------------------------------------
export type WorkItem = {
  title: string;
  role: string;
  summary: string;
  highlights: string[];
  tech: string[];
  impact?: string;
  photo?: string;
  photoOverlay?: string;
  trailer?: string;
  purpose?: string;
  problemBefore?: string;
  labAgents?: LabAgent[];
  status?: "in-progress";
};

export type LabAgent = { name: string; status: "live" | "developing" | "restricted"; photo?: string };

export type LabFutureIdea = { name: string; note: string };

export const workItems: WorkItem[] = [
  {
    title: "Recruit",
    role: "ออกแบบระบบ + พัฒนา",
    summary:
      "ระบบ AI ที่รับ brief งานเป็นภาษาไทยจากฝ่าย HR แล้วช่วยคัดกรอง/จัดอันดับผู้สมัครให้อัตโนมัติ แทนการอ่านเรซูเม่ทีละใบ",
    highlights: [
      "แปลง brief ภาษาไทยเป็นเกณฑ์คัดกรองที่ใช้ได้จริง",
      "ให้คะแนนและจัดลำดับผู้สมัครจากหลักฐานจริงในเรซูเม่",
      "มี chatbot ตอบแทน HR อัตโนมัติเมื่อมีผู้สมัครเข้ามาเยอะ",
      "ระบบส่งข้อความแจ้งผ่าน/ไม่ผ่าน และนัดสัมภาษณ์อัตโนมัติ",
    ],
    tech: ["Next.js", "OpenAI", "Supabase"],
    impact: "ช่วยลดเวลาของ HR จากการตอบแชททีละคนเป็นการคัดกรองแทน เมื่อมีคนสมัครเข้ามาเยอะ และจัดการได้อย่างเป็นระบบ",
    photo: "/work-recruit.jpg",
    trailer: "/trailer-recruit.mp4",
    purpose: "ทำเพื่อลดเวลาของ HR เพื่อให้โฟกัสไปที่ส่วนอื่น ไม่ใช่การตอบแชทเป็นหลัก ควรจะทำหน้าที่ ว่า คนนี้ดีหรือไม่ดี ตามเรซูเม่และข้อมูลที่กรอกมา",
    problemBefore: "ต้องตอบแชทเอง จนทำให้เสียเวลา แถมยังต้องมานั่งคัดผู้สมัครอีก",
  },
  {
    title: "Relife Academy",
    role: "ออกแบบระบบ + พัฒนา",
    summary:
      "แพลตฟอร์มฝึกขายด้วย AI — พนักงานฝึกคุยกับ AI ที่สวมบทบาทเป็นลูกค้า แล้วมี AI อีกตัวช่วยให้คะแนน/feedback การขาย",
    highlights: [
      "AI ลูกค้าจำลองสถานการณ์ขายได้หลากหลายแบบ",
      "ให้ feedback การขายแบบมีหลักเกณฑ์ ไม่ใช่แค่ความรู้สึก",
      "ฟีเจอร์ใหม่: ทดสอบว่าถ้าแอดมินเจอสถานการณ์นี้ จะรับมือกับลูกค้าประเภทนี้ยังไง",
    ],
    tech: ["Next.js", "OpenAI", "Whisper"],
    impact: "รวมการเรียนการสอนไว้ในแพลตฟอร์มเดียว ลดเวลาที่ต้องไล่เข้าหลายลิงก์แยกกัน",
    photo: "/work-relife-academy.jpg",
    trailer: "/trailer-academy.mp4",
    purpose: "ให้พนักงานฝึกซ้อมการขายได้ตลอดเวลา โดยไม่ต้องรอพี่ๆ ว่าง",
    problemBefore:
      "เดิมพนักงานต้องเข้าดูคลิปสอนทีละลิงก์ใน Google Drive และทำแบบทดสอบแยกผ่าน Google Form ไม่มีที่รวมศูนย์",
  },
  {
    title: "relife-lp (Lab Farm)",
    role: "ออกแบบ + พัฒนาเว็บขาย",
    summary: "เว็บไซต์ขายผลิตภัณฑ์เสริมอาหารแบรนด์ Lab Farm แบบ config-driven ปรับหน้าตาและเนื้อหาได้ไว",
    highlights: [
      "โครงสร้างแบบ config-driven ปรับได้ไม่ต้องแก้โค้ดทุกครั้ง",
      "โฟกัสที่ conversion และความน่าเชื่อถือของแบรนด์",
      "ปรับแต่งเองได้ทั้งหมด ไม่ fixed แบบเดียว ขอปรับปุ่ม เปลี่ยนรูป ได้ตลอด",
    ],
    tech: ["Next.js", "Tailwind"],
    impact: "เพิ่มแหล่งยอดขายให้บริษัท ยอดขายสะสมตอนนี้ ฿11,350 (18 กล่อง)",
    photo: "/work-relife-lp.png",
    trailer: "/trailer-relife-lp.mp4",
    purpose: "ให้ทีมการตลาดมีหน้าขายที่พร้อมใช้และปรับแต่งได้เร็วสำหรับแคมเปญ Lab Farm",
    problemBefore: "มีหน้า salepage ของ labfarm อยู่แล้ว แต่ข้อเสียคือไม่สามารถ custom เองได้ในทุกส่วน",
  },
  {
    title: "Telesales & Warroom Dashboard",
    role: "ออกแบบระบบ + พัฒนา",
    summary:
      "รวม Telesales leaderboard กับ Warroom dashboard เป็นโปรเจกต์เดียว — เทเลเซลล์เห็นยอดขาย/talk-time ของตัวเองแบบ real-time ส่วน Admin เห็นยอดขายของทุกคนแบบ real-time เช่นกัน",
    highlights: [
      "แสดงยอดขายและ talk-time แบบ real-time แทนการเข้าไปเช็คเอง",
      "ช่วยให้ supervisor จี้จุดและ motivate ได้ตรงเวลา",
    ],
    tech: ["Next.js", "Supabase"],
    impact: "ใช้งานจริงทั้งฝั่งเทเลเซลล์และแอดมิน",
    photo: "/warroom-leaderboard.png",
    trailer: "/trailer-dashboard.mp4",
    purpose: "ให้ทั้งเทเลเซลล์และ supervisor เห็นภาพผลงานแบบ real-time โดยไม่ต้องเข้าระบบไปเช็คเอง",
    problemBefore: "ต้องเข้าไปเช็คยอดขาย/talk-time เองทีละระบบ ไม่มีภาพรวมแบบ real-time",
  },
  {
    title: "ERP",
    role: "ออกแบบระบบ + พัฒนา",
    status: "in-progress",
    summary:
      "ระบบ ERP ที่รวมทุกโมดูลของบริษัทไว้ในที่เดียว เช่น Ads, บัญชี, Stock, Recruit, Telesales, Academy และอีกกว่า 10 โมดูล แทนที่จะต้องเข้าหลายลิงก์แยกกันเหมือนเดิม",
    highlights: [
      "รวมข้อมูลจากหลายระบบเดิมมาไว้ที่จุดเดียว ไม่ต้องสลับลิงก์ไปมา",
      "กำลังจัดการหน้า UI/UX และฟีเจอร์ต่างๆ ให้ดีที่สุดก่อนเปิดให้ลองใช้",
    ],
    tech: ["Next.js", "Supabase", "TypeScript"],
    impact: "กำลังจะเปิดให้ลองใช้เร็วๆ นี้เพื่อเก็บ feedback",
    trailer: "/trailer-erp.mp4",
    purpose: "รวมทุก module ของบริษัทไว้ในที่เดียว ให้ข้อมูลมาจากจุดเดียวแทนที่จะกระจัดกระจาย",
    problemBefore: "มีระบบจริงอยู่ก่อนแล้ว แต่พนักงานต้องหาและเข้าหลายลิงก์เพื่อเข้าแต่ละระบบแยกกัน",
  },
  {
    title: "AI Agent Lab",
    role: "ออกแบบ + พัฒนา agent ภายในบริษัท",
    photo: "/ai-agent-lab-bg.png",
    photoOverlay: "AI AGENT LAB",
    summary:
      "แล็บทดลอง AI agent ภายในบริษัท — แต่ละตัวถูกสร้างมาช่วยงานเฉพาะด้าน บางตัวใช้งานจริงแล้ว บางตัวยังอยู่ระหว่างพัฒนา",
    highlights: [
      "AI agent ตรวจสอบและนำเข้าสลิป",
      "AI agent transcription",
      "AI agent วิเคราะห์ไฟล์เสียง",
      "AI agent หาผู้สมัครใน JobBKK และ LinkedIn",
      "AI agent ทดสอบคุยกับลูกค้าใน Academy",
    ],
    tech: ["OpenAI", "Whisper", "n8n"],
    purpose: "ทดลองใช้ AI agent ช่วยแบ่งเบางานที่ซ้ำซากหรือใช้เวลานาน ในหลายแผนกของบริษัท",
    problemBefore: "งานซ้ำๆ หลายอย่างในบริษัทยังทำด้วยมือ ใช้เวลาที่เอาไปทำงานอื่นได้",
    labAgents: [
      { name: "ตรวจสอบและนำเข้าสลิป", status: "live", photo: "/lab-agent-slip.png" },
      { name: "Transcription", status: "live", photo: "/lab-agent-transcription.png" },
      { name: "วิเคราะห์ไฟล์เสียง", status: "live", photo: "/lab-agent-analysis.png" },
      { name: "หาผู้สมัครใน JobBKK และ LinkedIn", status: "live", photo: "/lab-agent-sourcing.png" },
      { name: "ทดสอบคุยกับลูกค้าใน Academy", status: "live", photo: "/lab-agent-roleplay.png" },
      { name: "[TODO: ชื่อ agent ที่กำลังพัฒนา]", status: "restricted" },
    ],
  },
];

export const labFutureIdeas: LabFutureIdea[] = [
  { name: "AI Sale Admin", note: "ผู้ช่วย admin ตอบแชทและแนะนำลูกค้าแบบอัตโนมัติ" },
  { name: "AI กรอกออเดอร์อัตโนมัติ", note: "กรอกออเดอร์เข้า CRM ให้อัตโนมัติ ลดเวลาแอดมิน" },
  { name: "AI Wind Tunnel", note: "จำลองบทสนทนาก่อนใช้จริง เพื่อดูว่าสคริปต์ไหนปิดการขายได้ดีที่สุด" },
  { name: "AI Spy", note: "คอยส่องและสรุปรายงานคู่แข่ง เช่นคอนเทนต์และความเคลื่อนไหว" },
  {
    name: "Ghost Resurrection Agent",
    note: "เก็บวิธีคิดและวิธีทำงานของพนักงานไว้ในตัว agent เผื่อวันที่คนคนนั้นลาออก mindset และวิธีการทำงานก็ยังอยู่ และฉลาดขึ้นเรื่อยๆ ทุกวัน",
  },
];

// Projects the client wants to build next — just names, no detail, shown as a
// simple non-clickable teaser card after the main work list.
export const futureProjects: string[] = ["Relife-CRM", "Relife-CDP", "Relife-OMS"];

// ---------------------------------------------------------------------------
// 05 — ความภูมิใจ (polaroid stack)
// ---------------------------------------------------------------------------
export type ProudItem = {
  title: string;
  description: string;
  photo?: string;
  photos?: string[];
  video?: string;
};
export const proudItems: ProudItem[] = [
  {
    title: "ออกแบบระบบที่ user พอใจและใช้ได้จริง",
    description:
      "บางงานคิดว่าอาจทำไม่ได้ แต่พอเอา skill ที่สะสมมาเชื่อมโยงกัน ก็ออกมาเป็นระบบที่ใช้ได้จริง",
    photos: ["/proud-system-1.png", "/proud-system-2.png", "/proud-system-3.png"],
  },
  {
    title: "พูดได้สองภาษา (tech + business)",
    description: "เรียนรู้จากความผิดพลาดจนตอนนี้แปลของยากให้คนไม่ใช่สายเทคเข้าใจได้",
    photos: ["/proud-bilingual-1.png", "/proud-bilingual-2.png"],
  },
  {
    title: "Telesales dashboard",
    description:
      "ทำแดชบอร์ดให้เทเลเซลล์เห็นยอดขายและ talk-time ของตัวเองแบบ real-time แทนที่จะต้องเข้าระบบไปเช็คเอง ช่วยให้ supervisor motivate หรือเข้าช่วยเหลือได้ตรงจุด เช่น talk-time หรือยอดขายยังไม่ถึงเป้า",
    video: "/telesales-leaderboard-demo.mp4",
  },
  {
    title: "ระบบ Recruit",
    description:
      "ระบบแรกที่ภูมิทำ ภูมิใจมากๆ ที่มีคนเชื่อใจให้เอาไปใช้งานจริง แล้วได้ feedback ที่ดีกลับมาจริงๆ",
    photo: "/work-recruit.jpg",
  },
];

// ---------------------------------------------------------------------------
// 06 — ผิดพลาด + เรียนรู้ (git diff, typewriter animation)
// ---------------------------------------------------------------------------
export type MistakeLesson = { commit: string; mistake: string; lesson: string };
export const mistakeLessons: MistakeLesson[] = [
  {
    commit: "fix: present ต้องพูดภาษา business ไม่ใช่ tech",
    mistake:
      "Present ครั้งแรกกับพี่อิทไม่รอบคอบพอ โดน feedback แรงมาก",
    lesson:
      "คนที่ไม่ได้อยู่สายเทคไม่ได้ต้องการรู้ว่า HTML/CSS คืออะไร เขาแค่ต้องการรู้ว่าสิ่งนี้ช่วยงานบริษัทได้ยังไง และเอาไปใช้ยังไงได้บ้าง",
  },
  {
    commit: "fix: draft ก่อนสร้างจริงเสมอเวลาแตะระบบเสี่ยง",
    mistake:
      "ดึงข้อมูลจาก HOPEFUL CRM ได้ แต่ลืมว่าระบบนี้สร้าง order ทันที ไม่มี draft และลบไม่ได้ ปล่อยให้ AI ลองสร้างออเดอร์ตรงๆ จนโดนตั้งข้อสงสัยว่าเป็นสาเหตุที่ระบบ HOPEFUL ล่ม",
    lesson:
      "ต้องรอบคอบกว่านี้ — เอาออเดอร์ที่จะสร้างจริงมาก่อน ให้ AI draft ว่าจะสร้างยังไง แล้วค่อยปล่อยให้สร้างจริง แทนที่จะรันยาวตรงๆ",
  },
];

// ---------------------------------------------------------------------------
// 07 — ทำได้ดี (skill bar)
// ---------------------------------------------------------------------------
export const strengths: string[] = [
  "เรียนรู้ไว เรียนรู้จากสิ่งที่ผิดพลาด",
  "ไม่ยอมแพ้ต่องานยาก เช่น เก็บยอดขาย Google ที่ดึงข้อมูลตรงๆ แบบ Facebook ไม่ได้",
  "ออกแบบ logic การนำเข้าข้อมูลให้ถูกต้อง",
  "ออกแบบระบบหลังบ้าน",
  "ยอมรับเมื่อตัวเองไม่รู้ เพื่อให้ได้เรียนรู้เพิ่ม",
  "เรียนรู้เรื่องใหม่ๆ อยู่ทุกวัน ตาม technology ทันอยู่เสมอ",
  "ความสัมพันธ์กับพี่ๆ ในบริษัทดีขึ้นทุกวัน",
  "หาทางแก้ปัญหาที่ไม่มีคำตอบสำเร็จรูป ลงไปดูข้อมูลจริงก่อนตัดสินใจ",
  "มีมาตรฐานของตัวเอง ไม่ยอมง่ายๆ จนกว่าจะตรงกับที่คิดไว้จริงๆ",
  "ทำงานได้กว้าง ทั้งสายเทค non-tech และ creative",
  "ทบทวนตัวเองตรงไปตรงมา ไม่ได้พูดแต่ข้อดี",
];

// ---------------------------------------------------------------------------
// 08 — สิ่งที่ขาด (issue checklist)
// ---------------------------------------------------------------------------
export const gaps: string[] = [
  "ทำระบบให้พี่ๆ หลายฝ่ายใช้ แต่ไม่มีระบบติดตามงานตัวเองแบบ real-time (% progress, กำลังทำอะไรอยู่)",
  "บางเรื่องใช้เวลานานเกินไปกว่าจะถาม",
  "บางเรื่องไม่ถามจนอาจนำไปสู่ความผิดพลาด",
  "ยังไม่รู้อีกหลายอย่างที่ต่อยอดความรู้ตอนนี้ได้",
  "อยากพัฒนาเรื่องการสื่อสารในงานให้มากกว่านี้",
  "ยังมีช่วงไฟตกๆ บ้าง มี burnout บ้าง แต่กลับมาได้ทุกครั้ง",
  "พื้นฐานสายเทคที่เรียนมาแบบไม่เป็นทางการ อาจมีช่องโหว่พื้นฐาน CS บางจุด",
  "ทำงานคนเดียวเป็นหลัก อาจขาดประสบการณ์ทำงานเป็นทีม dev / code review กับคนอื่น",
  "ทำระบบเร็ว แต่เอกสาร/knowledge transfer ยังน้อยไป",
];

// ---------------------------------------------------------------------------
// 07 — เรดาร์ จุดแข็ง/จุดที่ต้องพัฒนา
// ---------------------------------------------------------------------------
// Axes summarise `strengths` + `gaps` above into a handful of themes. Every
// sentence from both arrays is referenced by exactly one axis (via index), so
// the radar never becomes an abstraction that hides the original reflections.
// `value` (0-100) is a self-assessment: high where several strengths pile up,
// low where the gaps outnumber them.
export type RadarAxis = {
  key: string;
  label: string;
  labelEn: string;
  value: number;
  note: string;
  strengthRefs: number[];
  gapRefs: number[];
};

export const radarAxes: RadarAxis[] = [
  {
    key: "learning",
    label: "การเรียนรู้",
    labelEn: "Learning",
    value: 95,
    note: "แกนที่พุ่งสูงสุด — เรียนไว ยอมรับเมื่อไม่รู้ และตามเทคโนโลยีทันทุกวัน",
    strengthRefs: [0, 4, 5],
    gapRefs: [3],
  },
  {
    key: "grit",
    label: "ความไม่ยอมแพ้",
    labelEn: "Grit",
    value: 88,
    note: "งานที่ไม่มีคำตอบสำเร็จรูปคือที่ที่ทำได้ดีที่สุด แต่ยังมีช่วงไฟตกอยู่บ้าง",
    strengthRefs: [1, 7, 8],
    gapRefs: [5],
  },
  {
    key: "system",
    label: "ออกแบบระบบ",
    labelEn: "System design",
    value: 82,
    note: "ออกแบบหลังบ้านและ logic การนำเข้าข้อมูลได้เอง ครอบคลุมทั้งสายเทคและ non-tech",
    strengthRefs: [2, 3],
    gapRefs: [],
  },
  {
    key: "communication",
    label: "การสื่อสาร",
    labelEn: "Communication",
    value: 52,
    note: "ความสัมพันธ์ดีขึ้นเรื่อยๆ แต่ยังถามช้าไป — เป็นแกนที่ตั้งใจดันขึ้นเป็นอันดับแรก",
    strengthRefs: [6, 10],
    gapRefs: [1, 2, 4],
  },
  {
    key: "foundation",
    label: "พื้นฐาน CS",
    labelEn: "CS foundation",
    value: 42,
    note: "เรียนมาแบบไม่เป็นทางการ — ใช้งานได้จริงแต่รู้ตัวว่ามีช่องโหว่พื้นฐาน",
    strengthRefs: [],
    gapRefs: [6],
  },
  {
    key: "teamwork",
    label: "ทำงานเป็นทีม",
    labelEn: "Teamwork",
    value: 36,
    note: "ทำงานกับคนหลายฝ่ายได้ แต่ยังไม่เคยเขียนโค้ดคู่กับ dev คนอื่นหรือถูก review จริงจัง",
    strengthRefs: [9],
    gapRefs: [7],
  },
  {
    key: "documentation",
    label: "เอกสาร & ติดตามงาน",
    labelEn: "Docs & tracking",
    value: 28,
    note: "แกนที่ต่ำที่สุด — ส่งระบบได้เร็ว แต่เอกสารและความคืบหน้าที่คนอื่นมองเห็นยังตามไม่ทัน",
    strengthRefs: [],
    gapRefs: [0, 8],
  },
];

// ---------------------------------------------------------------------------
// 09 — ซัพพอร์ทจากบริษัท
// ---------------------------------------------------------------------------
export type SupportItem = { title: string; description: string };
export const supportItems: SupportItem[] = [
  {
    title: "AI แบบไม่เกี่ยง",
    description:
      "บริษัทซัพพอร์ตด้าน AI แบบเต็มที่มากๆ ไม่ว่าจะเป็น Claude, GPT หรือตัวอื่นๆ อีกมากมาย ออก subscription ให้ใช้งานได้แบบเต็มประสิทธิภาพ ไม่เคยเกี่ยงเลย",
  },
  {
    title: "เชื่อใจให้เรียนรู้",
    description:
      "ออกค่าคอร์สเรียนครั้งแรกๆ ให้ภูมิ ทั้งที่ตอนนั้นยังไม่มีอะไรพิสูจน์ตัวเองเลย แต่บริษัทให้โอกาสและเชื่อใจว่าสิ่งที่ภูมิเรียนจะเอามาช่วยงานบริษัทได้จริง ส่วนนี้ภูมิประทับใจมากจริงๆ",
  },
  {
    title: "สังคมและอุปกรณ์",
    description: "ซัพพอร์ตทั้งด้านสังคมและอุปกรณ์การทำงานอย่างเต็มที่ ไม่เคยรู้สึกขาดอะไร",
  },
];

// ---------------------------------------------------------------------------
// 10 — เป้าหมาย (peak statement → พีระมิดไหลลงข้างล่าง)
// ---------------------------------------------------------------------------
// milestones เรียงจาก "ชั้นที่ติดยอดที่สุด" ลงมาหา "ฐาน" ตามลำดับเหตุ-ผล:
// ฐานคือก้าวที่กำลังทำอยู่จริงตอนนี้ แล้วไต่ขึ้นไปทีละชั้นจนถึงยอด
export const goals = {
  peakLabel: "จุดพีคที่สุดของชีวิต",
  peak: "มีชีวิตและอิสรภาพเป็นของตัวเอง สามารถเลี้ยงดูคนที่รักและตัวเองได้ ทั้งเรื่องการเงินและอิสรภาพ — นี่คือสิ่งที่ภูมิอยากไปให้ถึงในช่วงพีคที่สุดของชีวิต",
  milestones: [
    "ให้แม่เลิกทำงานได้สักที",
    "เก่งด้าน AI Engineering แบบ Master",
    "เป็น top of mind ของลูกค้าหลายๆ คน",
    "มีความ unique ในสายงาน developer",
    "เข้ามหาวิทยาลัย MIT ที่อเมริกา",
  ],
  baseLabel: "จุดที่ภูมิยืนอยู่ตอนนี้",
};

// ---------------------------------------------------------------------------
// 11 — Scorecard
// ---------------------------------------------------------------------------
export type ScoreKey = "self" | "effectiveness" | "atmosphere";
export const scorecard: Record<
  ScoreKey,
  { label: string; score: number; max: number; note?: string }
> = {
  self: {
    label: "ประสิทธิภาพ",
    score: 7,
    max: 10,
    note:
      "ภูมิใช้ AI ได้คล่องขึ้นมาก เลือกเครื่องมือให้เหมาะกับแต่ละงานได้ และสื่อสารกับพี่ๆ ได้ตรงจุดเมื่อจำเป็น แต่ยังมีทางอีกยาวไกล ทั้งสกิลที่ต้องขัดเกลา ประสบการณ์ การสื่อสารที่ต้องดีกว่านี้ การใช้ AI ให้คล่องกว่านี้ และพื้นฐานที่ต้องแน่นกว่านี้ — ในโลกเทคที่อัปเดตทุกวัน ภูมิอาจไม่มีวันให้ตัวเองเต็ม 10 ได้เลย เพราะต้องเรียนรู้สิ่งใหม่อยู่เสมอเพื่อปรับให้เข้ากับงานอย่างเหมาะสม",
  },
  effectiveness: {
    label: "ประสิทธิผล",
    score: 6,
    max: 10,
    note:
      "ช่วงแรกภูมิส่งมอบงานได้เร็วและมั่นใจในระบบของตัวเองมากกว่านี้ แต่พอทำไปเรื่อยๆ ก็เริ่มรู้สึกว่าระบบยังไม่พร้อมใช้ ยังไม่ดีพอ UI/UX ยังไม่โอเค กังวลว่าคนจะใช้ได้จริงไหม จนบางครั้งทำงานจริงแต่ไม่มีใครเห็นผลลัพธ์ที่ออกมา",
  },
  atmosphere: {
    label: "บรรยากาศการทำงาน",
    score: 9,
    max: 10,
    note:
      "ที่นี่ดีกับภูมิมากๆ พี่ๆ อายุใกล้เคียงกัน สังคมดี คอยสนับสนุนและตอบทุกคำถาม มีปัญหาก็ปรึกษาได้เสมอ ไม่มีใครมองว่าภูมิเป็นแค่เด็ก ทุกคนเชื่อมั่นว่าภูมิทำได้ ภูมิเลยอยากต่อยอดตรงนี้และตอบแทนพี่ๆ — ที่ไม่ให้เต็ม 10 เพราะภูมิเชื่อว่าทุกบริษัทต้องมีปัญหาของตัวเองอยู่แล้วบ้าง แต่ภาพรวมมันดีมากจริงๆ",
  },
};

// ---------------------------------------------------------------------------
// 12 — ข้อเสนอ (Pull Request card)
// ---------------------------------------------------------------------------
export const proposals: string[] = [
  "อยากให้พี่ๆ ลองติดตามข่าว AI กันทุกวันครับ ไม่ต้องตามละเอียดขนาดต้องรู้ทุกอย่างว่าวันนี้มีโมเดลใหม่อะไรก็ได้ แค่ตามใน FB หรือ social ว่า AI ตัวไหนมีฟีเจอร์ใหม่ๆ ก็พอ เพราะ AI ยุคใหม่ช่วยงานที่ซ้ำซากน่าเบื่อได้เยอะมากจริงๆ ถ้ารู้ว่า AI ทำงานที่เราทำได้ ก็ปล่อยให้ AI ทำแทนได้เลย เพื่อความสะดวกของพี่ๆ เอง",
  "สิ่งที่ภูมิสังเกตมาตลอดคือเรื่องการแย่งลูกค้ากันระหว่างพนักงานขาย การแข่งขันสูงมันดีครับ กดดันให้ยอดขายดี แต่บางเคสที่ไม่ควรแย่งกันก็ดันแย่งกันจนได้ ภูมิคิดว่านี่เป็น pain point ที่บริษัทควรมีการสื่อสารและระบบมารองรับ เพราะบางทีมันอาจเกิดจากความไม่เคลียร์ของฝ่ายใดฝ่ายหนึ่งเอง",
  "ภูมิไม่รู้ปัญหาของพี่ๆ เท่าตัวพี่ๆ เอง เวลามีปัญหาอะไรที่อยากให้ภูมิช่วยทำ บอกภูมิได้เลยครับ ไม่ต้องพูดละเอียดก็ได้ แค่อธิบายว่าทุกวันนี้ทำงานอะไรอยู่ แล้วภูมิจะพิจารณาดูว่างานนั้นสามารถทำระบบหรือให้ AI เข้ามาช่วยแทนได้ไหม",
];

// ---------------------------------------------------------------------------
// 13 — Closing
// ---------------------------------------------------------------------------
export const closing = {
  headline:
    "ภูมิดีใจมากๆ ที่กล้าออกจาก comfort zone ของตัวเอง กล้าออกจากกรอบที่จะอยู่ต่อก็ได้ ทั้งสบายทั้งชิว แต่ภูมิเลือกจะออกมา ถ้าภูมิไม่ยอมออกมาจากตรงนั้นแล้วยึดติด ภูมิเชื่อว่าตอนนี้คงไม่ได้พัฒนาไปไหนเหมือนกัน",
  subtext:
    "ขอบคุณ Relife Solutions ที่เปิดโอกาสให้เด็กอายุ 18 ที่เพิ่งจบ ม.6 คนนี้ด้วยใจจริง ทุกคนใจดีกับภูมิมากจริงๆ ทั้งที่ตอนแรกภูมิมีแค่ไฟ ยังไม่รู้เลยว่าจะทำได้ไหม แต่พี่ๆ ก็ยังเชื่อใจภูมิมาตลอด ขอบคุณทุกคนมากจริงๆ ครับ ถ้าไม่มีพี่ๆ คงไม่มีภูมิในวันนี้",
};

// Photo story shown on the closing page as a walkthrough reel, not a plain
// gallery. Ordered as a narrative, not strict upload date — ภูมิ's own dividing
// line is hair colour ("ผมทอง" era first, "ผมดำ" era after), so `era` marks
// which side of that line a beat falls on. `photos` can hold more than one
// image when several screenshots make up a single story beat (e.g. the n8n
// build). Fill in each `[TODO: <original filename>]` with the real file once
// it's copied into /public — the placeholder names the exact Drive file so
// wiring it up is a straight find-and-replace.
export type MemoryBeat = {
  photos?: string[];
  video?: string;
  caption: string;
  era: "blonde" | "black" | "bonus";
};

export const memoryReel: MemoryBeat[] = [
  { photos: ["/memories/3.jpg"], caption: "มาทำงานวันแรก", era: "blonde" },
  {
    photos: [
      "/memories/5.png",
      "/memories/6.png",
      "/memories/7.png",
      "/memories/8.png",
      "/memories/10.png",
      "/memories/11.png",
    ],
    caption: "AI ตัวแรกที่ทำ (n8n)",
    era: "blonde",
  },
  { photos: ["/memories/4.png"], caption: "บทเรียนที่พี่อิทให้มาเรียนเพิ่ม", era: "blonde" },
  { photos: ["/memories/12.jpg"], caption: "บทเรียน OpenClaw ของพี่ต๊ะ", era: "blonde" },
  { photos: ["/memories/IMG_4659.png"], caption: "OpenClaw ตัวแรก", era: "blonde" },
  { photos: ["/memories/IMG_A80D898B.jpeg"], caption: "present OpenClaw ให้พี่ๆ ฟัง", era: "blonde" },
  {
    photos: ["/memories/IMG_4604.jpg"],
    caption: "เรียนพื้นฐานเว็บให้แน่น — HTML, CSS, JS, Docker, SQL",
    era: "blonde",
  },
  { photos: ["/memories/IMG_4656.jpg"], caption: "AI agent ตัวใหม่ตอนนั้น: Hermes", era: "blonde" },
  { photos: ["/memories/IMG_4664.png"], caption: "AI agent สำหรับส่งสลิป", era: "blonde" },
  { photos: ["/memories/13.jpg"], caption: "ถ่ายรูปเพราะอยากจัดออฟฟิศใหม่", era: "blonde" },
  { photos: ["/memories/IMG_4758.png"], caption: "Dashboard ของ Telesales เวอร์ชันแรก", era: "blonde" },
  { photos: ["/memories/IMG_4759.jpg"], caption: "Makro มาส่งของ!", era: "blonde" },
  { photos: ["/memories/14.jpg"], caption: "กินเลี้ยงกับพี่เทเลเซลล์ กินเยอะมาก", era: "blonde" },
  {
    photos: ["/memories/IMG_4961.jpg", "/memories/IMG_4962.jpg"],
    caption: "ไปคุยงานนอกออฟฟิศกับพี่อิท",
    era: "blonde",
  },
  { photos: ["/memories/15.jpg"], caption: "แอบถ่ายรูปตอนเที่ยง", era: "blonde" },

  // The turning point — this is the beat the era switches on.
  { photos: ["/memories/IMG_5016.jpg"], caption: "ผมดำแล้ว!!", era: "black" },

  { photos: ["/memories/IMG_5225.jpg"], caption: "ผลงาน Dashboard Telesales v2 ขึ้นจอของจริง", era: "black" },
  { photos: ["/memories/IMG_5226.jpg"], caption: "self-study เรียนรู้เอง", era: "black" },
  { photos: ["/memories/IMG_5233.jpg"], caption: "NAS ครั้งแรก", era: "black" },
  { photos: ["/memories/IMG_5294.jpg"], caption: "รอซื้อไอติมกัน", era: "black" },
  { photos: ["/memories/IMG_5399.jpg"], caption: "เสนอ present ระบบของเทเลเซลล์ v1", era: "black" },
  { video: "/memories/IMG_5479.mp4", caption: "สร้างทีม dev ของตัวเอง (พัง)", era: "black" },
  { photos: ["/memories/IMG_5526.png"], caption: "โดนจนได้...", era: "black" },
  { photos: ["/memories/IMG_5678.jpg"], caption: "self-study อีกแล้ว!!", era: "black" },
  { photos: ["/memories/IMG_5679.png"], caption: "ทำงานทุกที่ ไม่เว้นแม้แต่ตอนอยู่ในห้องน้ำ", era: "black" },
  { video: "/memories/IMG_5689.mp4", caption: "วันเกิดพี่นุชช", era: "black" },
  { photos: ["/memories/IMG_5766.jpg"], caption: "คอมผมไม่ไหวแล้วครับ", era: "black" },

  // Bonus — surfaced separately at the end of the reel, not part of the main
  // chronological walkthrough.
  {
    photos: ["/memories/IMG_5801.png", "/memories/IMG_5802.png"],
    caption: "bonus: คลิปที่ไม่มีใครเคยเห็น — คลิป AI ก่อนมาสัมภาษณ์",
    era: "bonus",
  },
];
