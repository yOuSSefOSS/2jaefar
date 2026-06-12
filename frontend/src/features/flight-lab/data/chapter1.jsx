import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

export const chapter1Data = {
  intro: {
    id: 'intro',
    en: (
      <div className="space-y-6">
        <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-sm font-bold tracking-widest uppercase mb-4">
          Chapter 1
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
          General Definitions & <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">The Atmosphere</span>
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed font-light">
          Air is the working medium for flight. Changes in temperature, pressure, and density directly affect lift, drag, and engine performance.
        </p>
      </div>
    ),
    ar: (
      <div className="space-y-6 text-right">
        <div className="inline-block px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full text-sm font-bold tracking-widest uppercase mb-4">
          الفصل الأول
        </div>
        <h1 className="text-5xl font-extrabold text-white tracking-tight leading-tight">
          التعاريف العامة و <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">الغلاف الجوي</span>
        </h1>
        <p className="text-xl text-slate-400 leading-relaxed font-light">
          الهواء هو الوسيط الأساسي للطيران. التغيرات في درجة الحرارة (Temperature)، الضغط (Pressure)، والكثافة (Density) تؤثر بشكل مباشر على قوى الرفع (Lift)، السحب (Drag)، وأداء المحرك.
        </p>
      </div>
    )
  },
  definitions: {
    id: 'definitions',
    en: (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">Core Physics Definitions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Force</h3>
            <p className="text-slate-300">A push or pull on an object, causing it to move or change motion. Measured in Newtons (N).</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-purple-400 mb-2">Gravity</h3>
            <p className="text-slate-300">The force that attracts a body toward the center of the earth, or toward any other physical body having mass.</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-sky-400 mb-2">Velocity & Acceleration</h3>
            <p className="text-slate-300"><strong>Velocity:</strong> Speed in a given direction (e.g., 100 knots heading North).<br/><strong>Acceleration:</strong> The rate of change of velocity per unit of time.</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-amber-400 mb-2">Moment</h3>
            <p className="text-slate-300">The turning effect of a force around a pivot. Calculated as <InlineMath math="Force \times Distance" />.</p>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 mt-4">
          <h3 className="text-xl font-bold text-sky-400 mb-2">Mass vs Weight</h3>
          <p className="text-slate-300 mb-4">
            <strong className="text-white">Mass</strong> is the amount of matter in an object, measured in kilograms (kg). <strong className="text-red-400">Mass is NOT a force.</strong>
          </p>
          <p className="text-slate-300">
            <strong className="text-white">Weight</strong> is the force exerted by gravity on an aircraft's mass. It pulls the plane downward.
          </p>
          <div className="mt-4 p-4 bg-slate-950 rounded-xl font-mono text-center text-xl text-emerald-400">
            Weight = Mass × Gravity
          </div>
        </div>
      </div>
    ),
    ar: (
      <div className="space-y-8 text-right">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">تعريفات فيزيائية أساسية</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">القوة (Force)</h3>
            <p className="text-slate-300">دفع أو سحب لجسم ما، مما يتسبب في حركته أو تغيير حركته. تُقاس بوحدة النيوتن (Newtons).</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-purple-400 mb-2">الجاذبية (Gravity)</h3>
            <p className="text-slate-300">القوة التي تجذب جسماً نحو مركز الأرض أو نحو أي جسم مادي آخر له كتلة.</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-sky-400 mb-2">السرعة والتسارع (Velocity & Acceleration)</h3>
            <p className="text-slate-300"><strong>السرعة المتجهة:</strong> السرعة في اتجاه معين.<br/><strong>التسارع:</strong> معدل تغير السرعة بالنسبة للزمن.</p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5">
            <h3 className="text-xl font-bold text-amber-400 mb-2">العزم (Moment)</h3>
            <p className="text-slate-300">تأثير الدوران لقوة حول محور. يُحسب كـ <InlineMath math="Force \times Distance" />.</p>
          </div>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 mt-4">
          <h3 className="text-xl font-bold text-sky-400 mb-2">الكتلة مقابل الوزن (Mass vs Weight)</h3>
          <p className="text-slate-300 mb-4">
            <strong className="text-white">الكتلة (Mass)</strong> هي كمية المادة في جسم ما، تُقاس بالكيلوجرام (kg). <strong className="text-red-400">الكتلة ليست قوة!</strong>
          </p>
          <p className="text-slate-300">
            <strong className="text-white">الوزن (Weight)</strong> هو القوة التي تبذلها الجاذبية على كتلة الطائرة وتجذبها للأسفل.
          </p>
          <div className="mt-4 p-4 bg-slate-950 rounded-xl font-mono text-center text-xl text-emerald-400" dir="ltr">
            Weight = Mass × Gravity
          </div>
        </div>
      </div>
    )
  },
  axes: {
    id: 'axes',
    en: (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">Aircraft Axes</h2>
        <p className="text-lg text-slate-300">An aircraft operates in three dimensions and rotates around its Center of Gravity (CG).</p>
        
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border-l-4 border-l-emerald-500">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">1. Longitudinal Axis (Roll)</h3>
            <p className="text-slate-300">Runs lengthwise from nose to tail. Rotation around this axis is called <strong>Roll</strong>, controlled by the Ailerons.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border-l-4 border-l-sky-500">
            <h3 className="text-xl font-bold text-sky-400 mb-2">2. Lateral Axis (Pitch)</h3>
            <p className="text-slate-300">Runs wingtip to wingtip. Rotation around this axis is called <strong>Pitch</strong> (nose up/down), controlled by the Elevators.</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border-l-4 border-l-amber-500">
            <h3 className="text-xl font-bold text-amber-400 mb-2">3. Vertical/Normal Axis (Yaw)</h3>
            <p className="text-slate-300">Runs straight up and down through the CG. Rotation around this axis is called <strong>Yaw</strong> (nose left/right), controlled by the Rudder.</p>
          </div>
        </div>
      </div>
    ),
    ar: (
      <div className="space-y-8 text-right">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">محاور الطائرة (Aircraft Axes)</h2>
        <p className="text-lg text-slate-300">تعمل الطائرة في ثلاثة أبعاد وتدور حول مركز ثقلها (CG).</p>
        
        <div className="space-y-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border-r-4 border-r-emerald-500">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">1. المحور الطولي (Longitudinal Axis - Roll)</h3>
            <p className="text-slate-300">يمتد من الأنف إلى الذيل. الدوران حول هذا المحور يسمى <strong>الدحرجة (Roll)</strong>، ويتم التحكم فيه بواسطة الجنيحات (Ailerons).</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border-r-4 border-r-sky-500">
            <h3 className="text-xl font-bold text-sky-400 mb-2">2. المحور الجانبي (Lateral Axis - Pitch)</h3>
            <p className="text-slate-300">يمتد من طرف الجناح إلى طرف الجناح. الدوران حول هذا المحور يسمى <strong>الانحدار (Pitch)</strong>، ويتم التحكم فيه بواسطة الروافع (Elevators).</p>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-2xl border-r-4 border-r-amber-500">
            <h3 className="text-xl font-bold text-amber-400 mb-2">3. المحور العمودي (Vertical Axis - Yaw)</h3>
            <p className="text-slate-300">يمتد عمودياً عبر مركز الثقل. الدوران حول هذا المحور يسمى <strong>الانحراف (Yaw)</strong>، ويتم التحكم فيه بواسطة الدفة (Rudder).</p>
          </div>
        </div>
      </div>
    )
  },
  forces: {
    id: 'forces',
    en: (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">The Four Forces of Flight</h2>
        <p className="text-lg text-slate-300">Every airplane in flight is acted upon by four basic forces.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-emerald-500/30">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">Lift (Up)</h3>
            <p className="text-slate-300 text-sm">Created by the effect of airflow as it passes over and under the wing. Counteracts weight.</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-red-500/30">
            <h3 className="text-xl font-bold text-red-400 mb-2">Weight (Down)</h3>
            <p className="text-slate-300 text-sm">The downward pull of gravity. Must be equaled by lift for level flight.</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-sky-500/30">
            <h3 className="text-xl font-bold text-sky-400 mb-2">Thrust (Forward)</h3>
            <p className="text-slate-300 text-sm">The forward force produced by the engine/propeller. Overcomes drag.</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-amber-500/30">
            <h3 className="text-xl font-bold text-amber-400 mb-2">Drag (Backward)</h3>
            <p className="text-slate-300 text-sm">The rearward, retarding force caused by disruption of airflow by the wing, fuselage, and protruding objects.</p>
          </div>
        </div>
      </div>
    ),
    ar: (
      <div className="space-y-8 text-right">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">القوى الأربع للطيران</h2>
        <p className="text-lg text-slate-300">تتعرض كل طائرة في حالة الطيران لأربع قوى أساسية.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-emerald-500/30">
            <h3 className="text-xl font-bold text-emerald-400 mb-2">الرفع (Lift - أعلى)</h3>
            <p className="text-slate-300 text-sm">ينشأ من تأثير تدفق الهواء فوق وتحت الجناح. يعاكس الوزن.</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-red-500/30">
            <h3 className="text-xl font-bold text-red-400 mb-2">الوزن (Weight - أسفل)</h3>
            <p className="text-slate-300 text-sm">قوة الجاذبية للأسفل. يجب أن يعادلها الرفع للطيران المستوي.</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-sky-500/30">
            <h3 className="text-xl font-bold text-sky-400 mb-2">الدفع (Thrust - للأمام)</h3>
            <p className="text-slate-300 text-sm">القوة الأمامية التي ينتجها المحرك. تتغلب على السحب.</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-2xl border border-amber-500/30">
            <h3 className="text-xl font-bold text-amber-400 mb-2">السحب (Drag - للخلف)</h3>
            <p className="text-slate-300 text-sm">قوة الاحتكاك والمقاومة الناتجة عن اصطدام الهواء بهيكل الطائرة.</p>
          </div>
        </div>
      </div>
    )
  },
  air_properties: {
    id: 'air_properties',
    en: (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">Properties of Air</h2>
        
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 border-l-4 border-l-amber-500">
          <h3 className="text-xl font-bold text-amber-400 mb-2">Air Density ($\rho$)</h3>
          <p className="text-slate-300">
            The mass of air per unit volume (<InlineMath math="kg/m^3" />). Think of it as how closely packed the air molecules are.
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 border-l-4 border-l-purple-500">
          <h3 className="text-xl font-bold text-purple-400 mb-2">Air Pressure</h3>
          <p className="text-slate-300 mb-4">
            The push that air exerts on a surface, caused by air molecules bumping into it.
          </p>
        </div>
      </div>
    ),
    ar: (
      <div className="space-y-8 text-right">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">خصائص الهواء</h2>
        
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 border-r-4 border-r-amber-500">
          <h3 className="text-xl font-bold text-amber-400 mb-2">كثافة الهواء (Air Density - $\rho$)</h3>
          <p className="text-slate-300">
            كتلة الهواء لكل وحدة حجم (<InlineMath math="kg/m^3" />). تخيلها كمدى تقارب جزيئات الهواء مع بعضها.
          </p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 border-r-4 border-r-purple-500">
          <h3 className="text-xl font-bold text-purple-400 mb-2">الضغط الجوي (Air Pressure)</h3>
          <p className="text-slate-300 mb-4">
            الدفع الذي يمارسه الهواء على السطح، والناتج عن اصطدام جزيئات الهواء به.
          </p>
        </div>
      </div>
    )
  },
  layers: {
    id: 'layers',
    en: (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">The Atmosphere</h2>
        
        <div className="bg-sky-950/40 p-8 rounded-3xl border border-sky-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute -right-4 -top-4 text-[150px] opacity-10">🌍</div>
          <h3 className="text-2xl font-black text-sky-400 mb-2 relative z-10">What is the Atmosphere?</h3>
          <p className="text-lg text-slate-200 leading-relaxed relative z-10">
            The atmosphere is the <strong>blanket of air surrounding the Earth</strong>. It's a mixture of gases (mostly Nitrogen 78% and Oxygen 21%) that supports life and makes flight possible. It is divided into distinct layers based on how temperature behaves as you climb.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-sky-900/40 to-transparent border border-sky-500/20 rounded-2xl">
            <h3 className="text-2xl font-bold text-sky-400 mb-2">1. Troposphere (0 - 11 km)</h3>
            <p className="text-slate-300 font-bold mb-2">Where Aviation Lives.</p>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              <li>Where commercial jets cruise and weather forms.</li>
              <li><strong>Temperature</strong> decreases steadily with altitude.</li>
              <li><strong>Pressure</strong> decreases rapidly with altitude.</li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-br from-indigo-900/40 to-transparent border border-indigo-500/20 rounded-2xl">
            <h3 className="text-2xl font-bold text-indigo-400 mb-2">2. Stratosphere (11 - 50 km)</h3>
            <ul className="list-disc pl-5 text-slate-300 space-y-2">
              <li><strong>Temperature</strong> increases with altitude.</li>
              <li>Contains the Ozone layer.</li>
              <li>Very stable air with little to no weather.</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    ar: (
      <div className="space-y-8 text-right">
        <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4">الغلاف الجوي</h2>
        
        <div className="bg-sky-950/40 p-8 rounded-3xl border border-sky-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute -left-4 -top-4 text-[150px] opacity-10">🌍</div>
          <h3 className="text-2xl font-black text-sky-400 mb-2 relative z-10">ما هو الغلاف الجوي؟</h3>
          <p className="text-lg text-slate-200 leading-relaxed relative z-10">
            الغلاف الجوي هو <strong>طبقة الهواء التي تحيط بالأرض</strong>. وهو مزيج من الغازات (معظمها النيتروجين 78٪ والأكسجين 21٪) تدعم الحياة وتجعل الطيران ممكناً. وينقسم إلى طبقات مميزة بناءً على كيفية تغير درجة الحرارة مع الارتفاع.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-bl from-sky-900/40 to-transparent border border-sky-500/20 rounded-2xl">
            <h3 className="text-2xl font-bold text-sky-400 mb-2">1. التروبوسفير (Troposphere - 0-11 km)</h3>
            <p className="text-slate-300 font-bold mb-2">حيث يعيش الطيران.</p>
            <ul className="list-disc pr-5 text-slate-300 space-y-2">
              <li>تحدث فيها معظم ظواهر الطقس وتطير فيها الطائرات.</li>
              <li><strong>درجة الحرارة</strong> تنخفض باستمرار مع الارتفاع.</li>
              <li><strong>الضغط</strong> ينخفض بشكل كبير مع الارتفاع.</li>
            </ul>
          </div>

          <div className="p-6 bg-gradient-to-bl from-indigo-900/40 to-transparent border border-indigo-500/20 rounded-2xl">
            <h3 className="text-2xl font-bold text-indigo-400 mb-2">2. الستراتوسفير (Stratosphere - 11-50 km)</h3>
            <ul className="list-disc pr-5 text-slate-300 space-y-2">
              <li><strong>درجة الحرارة</strong> ترتفع مع الارتفاع.</li>
              <li>تحتوي على طبقة الأوزون.</li>
              <li>هواء مستقر جداً مع غياب للطقس تقريباً.</li>
            </ul>
          </div>
        </div>
      </div>
    )
  },
  summary: {
    id: 'summary',
    en: (
      <div className="space-y-8 mt-12 bg-emerald-900/20 p-8 rounded-3xl border border-emerald-500/20">
        <h2 className="text-3xl font-bold text-emerald-400 border-b border-emerald-800/50 pb-4">Chapter 1 Summary</h2>
        <ul className="list-disc pl-6 space-y-3 text-slate-300 text-lg">
          <li><strong>Mass vs Weight:</strong> Mass is constant matter; Weight is Mass × Gravity (the downward pull).</li>
          <li><strong>The 4 Forces:</strong> Lift (up) balances Weight (down). Thrust (forward) balances Drag (backward).</li>
          <li><strong>Aircraft Axes:</strong> Roll (Longitudinal), Pitch (Lateral), and Yaw (Vertical).</li>
          <li><strong>Air Properties:</strong> Air density (mass per volume) and pressure decrease with altitude, severely impacting performance.</li>
          <li><strong>Atmosphere:</strong> Most flight and weather happen in the Troposphere, where temperature drops steadily with altitude.</li>
        </ul>
      </div>
    ),
    ar: (
      <div className="space-y-8 mt-12 bg-emerald-900/20 p-8 rounded-3xl border border-emerald-500/20 text-right">
        <h2 className="text-3xl font-bold text-emerald-400 border-b border-emerald-800/50 pb-4">ملخص الفصل الأول</h2>
        <ul className="list-disc pr-6 space-y-3 text-slate-300 text-lg">
          <li><strong>الكتلة والوزن:</strong> الكتلة ثابتة، بينما الوزن هو الكتلة × الجاذبية (قوة السحب للأسفل).</li>
          <li><strong>القوى الأربع:</strong> الرفع (لأعلى) يعاكس الوزن (لأسفل). الدفع (للمقدمة) يعاكس السحب (للخلف).</li>
          <li><strong>محاور الطائرة:</strong> الدحرجة (المحور الطولي)، الانحدار (المحور الجانبي)، والانحراف (المحور العمودي).</li>
          <li><strong>خصائص الهواء:</strong> تنخفض كثافة الهواء والضغط مع الارتفاع، مما يؤثر على الأداء بشكل كبير.</li>
          <li><strong>الغلاف الجوي:</strong> يحدث معظم الطيران والطقس في طبقة التروبوسفير، حيث تنخفض الحرارة مع الارتفاع.</li>
        </ul>
      </div>
    )
  }
};
