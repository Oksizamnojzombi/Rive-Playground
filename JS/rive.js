// ============================================================
//  Rive — hero + lesson cards
//  Змінюй HERO_SRC і HERO_STATE_MACHINE щоб підключити свій hero .riv
//
//  Картки уроків монтуються ліниво (лише коли картка наближається
//  до viewport), а не всі одразу при завантаженні сторінки — з усіма
//  уроками одночасно це 14+ WebGL2-контекстів, і Chrome починає губити
//  найстаріші (GL_OUT_OF_MEMORY / CONTEXT_LOST_WEBGL), тому картки
//  зникають хаотично саме в Chrome.
// ============================================================

const HERO_SRC = "09.BonusLesson/Final_Result/09.mds_bonuslesson2.riv";
const HERO_STATE_MACHINE = "Room_MainStMashine";

const fitContain = {
  fit: rive.Fit.Contain,
  alignment: rive.Alignment.Center,
};

export const instances = [];

function mount(canvasId, src, stateMachine, artboard) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const inst = new rive.Rive({
    src,
    canvas,
    artboard,
    autoplay: true,
    stateMachines: stateMachine,
    layout: new rive.Layout(fitContain),
    onLoad: () => inst.resizeDrawingSurfaceToCanvas(),
  });
  instances.push(inst);
}

mount("heroCanvas", HERO_SRC, HERO_STATE_MACHINE);

// ---- lesson cards + "Real Work" logo: [canvasId, src, stateMachine, artboard?] ----
const LESSONS = [
  ["canvas1", "01.Lesson_01/Final_Result/01.mds_lesson_01_jumping_ball.riv", "Jumping_Ball"],
  ["canvas2", "02.Lesson_02/Final_Result/02.mds_lesson02_waterbubble.riv", "BubleStateMashine"],
  ["canvas3", "03.Lesson_03/Final_Result/03.mds_lesson03_bellymixing.riv", "Belly_SatetMashine"],
  ["canvas4", "04.Lesson_04/Final_Result/04.mds_lesson04_sunnyrock.riv", "RockSunnyStateMashine"],
  ["canvas5", "05.Lesson_05/Final_Result/05.mds_lesson05_artistparallax.riv", "Artist_StateMashineFinal"],
  ["canvas6", "06.Lesson_06/Final_Result/06.mds_lesson06_lazerboy.riv", "LazerBoyStateMashine"],
  ["canvas7", "07.Lesson_07/Final_Result/07.mds_lesson07_firesiage.riv", "Fire360_StateMashine"],
  ["canvas8", "08.Lesson_08/Final_Result/08.mds_lesson08_octopus.riv", "OctopusEcho"],
  ["canvas9", "09.Lesson_09/Final_Result/09.mds_lesson09.riv", "State Machine 1", "Inner Space"],
  ["canvas10", "10.Lesson_10/Final_Result/10.mdl_pluto_lesson10.riv", "PlutoRoutine", "Planet_Remap"],
  ["canvas11", "11.Lesson_11/Final_Result/11.mds_lesson11_spaceduo.riv", "SpaceDuo"],
  ["canvas12", "12.Lesson_12/Final_Result/12.mds_lesson12_pencil.riv", "FlyingPencil", "pencil comp"],
  ["canvas13", "13.Lesson_13/Final_Result/13.mds_lesson13_plant.riv", "WavyPlant"],
  ["canvas14", "14.Lesson_14/Final_Result/14.mds_lesson14_balance.riv", "DoubleBalance"],
  ["canvas15", "15.Lesson_15/Final_Result/15.mds_lesson15_followbat.riv", "FollowingBat"],
  ["canvas16", "16.Lesson_16/Final_Result/16.mds_lesson16_text.riv", "InteractText", "text Remap"],
  ["canvas17", "17.Lesson_17/Final_Result/17.mds_lesson17_walkcontrol.riv", "Walk", "walk - remap"],
  ["canvas18", "18.Lesson_18/Final_Result/18.mds_lesson18_outlinemorphing.riv", "Morphing"],
  ["canvasLogo", "AVQ_logo/avq_interactivelogo.riv", "Interactive_logo"],
];

const lessonData = new Map();
const lazyMount = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      mount(...lessonData.get(entry.target));
      lazyMount.unobserve(entry.target);
    });
  },
  { rootMargin: "400px 0px" } // start loading a bit before the card actually scrolls into view
);

LESSONS.forEach((lesson) => {
  const canvas = document.getElementById(lesson[0]);
  if (!canvas) return; // card temporarily removed/commented out in HTML
  lessonData.set(canvas, lesson);
  lazyMount.observe(canvas);
});
