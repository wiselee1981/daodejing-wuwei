/* ============================================================
   无为而治 · 互动课堂 —— 交互脚本
   ============================================================ */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- 1. 阅读进度条 + 章节导航 ---------- */
  var progressBar = $('#progressBar');
  var stepDots = $('#stepDots');
  var stepCounter = $('#stepCounter');
  var chapters = $$('.chapter');
  var totalSteps = chapters.length;

  chapters.forEach(function (ch, i) {
    var a = document.createElement('a');
    a.href = '#' + ch.id;
    a.title = ch.querySelector('h2') ? ch.querySelector('h2').textContent : '章节 ' + (i + 1);
    a.setAttribute('aria-label', '跳到第' + (i + 1) + '章');
    stepDots.appendChild(a);
  });
  var dotLinks = $$('a', stepDots);

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docH > 0 ? (scrollTop / docH) * 100 : 0;
    progressBar.style.width = pct + '%';
    var backTop = $('#backTop');
    if (scrollTop > 600) backTop.classList.add('show');
    else backTop.classList.remove('show');
  }

  /* ---------- 2. 入场动画 ---------- */
  var revealObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('visible');
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(function (el) { revealObs.observe(el); });

  /* ---------- 3. 章节高亮 ---------- */
  var chapterObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        var idx = chapters.indexOf(en.target);
        if (idx > -1) {
          dotLinks.forEach(function (d, j) { d.classList.toggle('active', j === idx); });
          stepCounter.textContent = (idx + 1) + ' / ' + totalSteps;
        }
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  chapters.forEach(function (ch) { chapterObs.observe(ch); });

  /* ---------- 4. HERO 远山视差 ---------- */
  var mountains = $$('.mountain');
  var ticking = false;
  function parallax() {
    var y = window.scrollY || 0;
    if (y > window.innerHeight * 1.2) return;
    mountains.forEach(function (m, i) {
      var speed = [0.05, 0.1, 0.16][i] || 0.1;
      m.style.transform = 'translateY(' + (y * speed) + 'px)';
    });
    ticking = false;
  }
  function onScroll() {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }

  /* ---------- 5. 误区翻牌 ---------- */
  var mythCards = $$('.myth-card');
  var definitionReveal = $('#definitionReveal');
  function checkAllFlipped() {
    var flipped = mythCards.filter(function (c) { return c.classList.contains('flipped'); }).length;
    if (flipped === mythCards.length) definitionReveal.classList.add('on');
  }
  mythCards.forEach(function (card) {
    function flip() { card.classList.toggle('flipped'); checkAllFlipped(); }
    card.addEventListener('click', flip);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });

  /* ---------- 6. 烹小鲜 ---------- */
  var wokScene = $('.wok-scene');
  var wokResult = $('.wok-result');
  var cookFeedback = $('#cookFeedback');
  var btnFry = $('#btnFry');
  var btnWait = $('#btnWait');
  var btnResetWok = $('#btnResetWok');
  var wokBusy = false;

  function resetWok() {
    wokScene.classList.remove('frying', 'broken', 'cooked');
    wokResult.classList.remove('show');
    wokResult.textContent = '煎好了吗？';
    cookFeedback.textContent = '点一个按钮试试';
    wokBusy = false;
  }
  btnResetWok.addEventListener('click', resetWok);

  btnFry.addEventListener('click', function () {
    if (wokBusy) return;
    wokBusy = true;
    resetWok();
    wokScene.classList.add('frying');
    cookFeedback.textContent = '翻啊翻……你比韩非子还勤快……';
    setTimeout(function () {
      wokScene.classList.remove('frying');
      wokScene.classList.add('broken');
      wokResult.textContent = '鱼碎了，全糊了 😖';
      wokResult.classList.add('show');
      cookFeedback.innerHTML = '「烹鱼烦则碎，治民烦则散」——<strong>老折腾，好事也变坏事</strong>。再试试另一个按钮？';
      wokBusy = false;
    }, 3200);
  });

  btnWait.addEventListener('click', function () {
    if (wokBusy) return;
    wokBusy = true;
    resetWok();
    wokScene.classList.add('cooked');
    wokResult.textContent = '小火慢煎，鱼完整又香 😋';
    wokResult.classList.add('show');
    cookFeedback.innerHTML = '你几乎「什么也没做」，鱼却熟了。<strong>这就是无为：不瞎折腾，让事情按规律自然完成。</strong>';
    wokBusy = false;
  });

  /* ---------- 7. 大禹治水 ---------- */
  var floodScene = $('.flood-scene');
  var floodStatus = $('.flood-status');
  var floodFeedback = $('#floodFeedback');
  var btnStartFlood = $('#btnStartFlood');
  var btnResetFlood = $('#btnResetFlood');
  var floodTabs = $$('.flood-tab');
  var currentMode = 'gun';
  var floodRunning = false;

  function resetFlood(keepMode) {
    floodScene.classList.remove('running', 'cracked', 'flooded', 'flowing');
    floodRunning = false;
    if (!keepMode) {
      currentMode = 'gun';
      floodTabs.forEach(function (t) { t.classList.toggle('active', t.dataset.mode === 'gun'); });
      floodScene.classList.add('mode-gun');
      floodScene.classList.remove('mode-yu');
    }
    floodStatus.textContent = currentMode === 'gun' ? '九年了，水越堵越高……' : '挖好渠道，等水来……';
    floodFeedback.textContent = '先选一种治水方法，再按「开工」';
  }
  btnResetFlood.addEventListener('click', function () { resetFlood(false); });

  floodTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      if (floodRunning) return;
      currentMode = tab.dataset.mode;
      floodTabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      floodScene.classList.remove('running', 'cracked', 'flooded', 'flowing');
      floodScene.classList.toggle('mode-gun', currentMode === 'gun');
      floodScene.classList.toggle('mode-yu', currentMode === 'yu');
      floodStatus.textContent = currentMode === 'gun' ? '九年了，水越堵越高……' : '挖好渠道，等水来……';
      floodFeedback.textContent = currentMode === 'gun'
        ? '鲧的办法：加高堤坝，把水堵住。按「开工」看看后果。'
        : '禹的办法：顺着地势挖渠，把水引向大海。按「开工」看看后果。';
    });
  });

  btnStartFlood.addEventListener('click', function () {
    if (floodRunning) return;
    floodRunning = true;

    if (currentMode === 'gun') {
      floodScene.classList.add('running');
      floodStatus.textContent = '堤坝加高！加高！再加高！';
      floodFeedback.textContent = '水被堵住，只能越涨越高……';
      setTimeout(function () {
        floodScene.classList.add('cracked');
        floodStatus.textContent = '咔嚓……堤坝裂了！';
        floodFeedback.textContent = '堵得越狠，水压越大……';
      }, 2500);
      setTimeout(function () {
        floodScene.classList.add('flooded');
        floodStatus.textContent = '轰——决堤了！村庄被淹 😱';
        floodFeedback.innerHTML = '鲧堵了 <strong>9 年</strong>，劳民伤财，洪水反而更凶，最后失败被流放羽山。<br>点「禹 · 疏」看看正确做法 ↓';
        floodRunning = false;
      }, 3800);
    } else {
      floodScene.classList.add('flowing');
      floodStatus.textContent = '挖渠！疏通河道……';
      floodFeedback.textContent = '顺着水往低处流的性子，给它一条出路……';
      setTimeout(function () {
        floodStatus.textContent = '洪水入海，村庄农田安然无恙 😊';
        floodFeedback.innerHTML = '禹治水 <strong>13 年</strong>（三过家门而不入），顺着水性疏导，成功！<br>孟子说：「禹之行水也，行其所无事也」——看起来没硬来，其实最高明。';
        floodRunning = false;
      }, 3000);
    }
  });

  /* ---------- 8. 文景之治模拟器 ---------- */
  var simSlider = $('#simSlider');
  var simValue = $('#simValue');
  var meterLife = $('#meterLife');
  var meterGrain = $('#meterGrain');
  var meterAge = $('#meterAge');
  var simFace = $('#simFace');
  var simVerdict = $('#simVerdict');
  var simBadge = $('#simBadge');

  function updateSim(v) {
    v = Number(v);
    simValue.textContent = v;
    var life = Math.max(4, Math.round(100 - v * 0.95));
    var grain = Math.max(2, Math.round(100 - v * 0.85));
    var age = Math.max(6, Math.round(100 - v * 0.7));
    meterLife.style.width = life + '%';
    meterGrain.style.width = grain + '%';
    meterAge.style.width = age + '%';

    if (v >= 80) {
      simFace.textContent = '😫';
      simVerdict.textContent = '秦式暴政：重税、徭役、大兴土木……百姓活不下去，王朝二世而亡。';
    } else if (v >= 50) {
      simFace.textContent = '😟';
      simVerdict.textContent = '折腾得有点多：百姓刚缓过一口气，还谈不上富。';
    } else if (v >= 25) {
      simFace.textContent = '🙂';
      simVerdict.textContent = '少折腾了：轻徭薄赋，百姓安心种田，粮仓慢慢满了。';
    } else {
      simFace.textContent = '😄';
      simVerdict.textContent = '文景之治！三十税一、与民休息——国家富得流油，攒下的家底够汉武帝打匈奴。';
    }
    simBadge.classList.toggle('on', v <= 24);
  }
  simSlider.addEventListener('input', function () { updateSim(simSlider.value); });
  updateSim(80);

  /* ---------- 9. 小剧场 ---------- */
  var scenes = [
    { who: '旁白', side: 'center', text: '萧何去世后，曹参接任相国。可他天天喝酒，一条法令都不改。年轻的汉惠帝坐不住了……' },
    { who: '汉惠帝', side: 'left', text: '曹相国！您天天饮酒不治事，是不是瞧不起朕？！' },
    { who: '曹参', side: 'right', text: '陛下息怒。敢问陛下，您与高祖皇帝相比，谁更英明神武？' },
    { who: '汉惠帝', side: 'left', text: '朕……怎敢和先帝相比。' },
    { who: '曹参', side: 'right', text: '那臣与萧何相比，谁更能干？' },
    { who: '汉惠帝', side: 'left', text: '您好像……比不上萧何。' },
    { who: '曹参', side: 'right', text: '陛下说得对！高祖与萧何平定天下，法令已经定得明明白白。咱们只要守住它、不乱改，天下自然安宁。' },
    { who: '旁白', side: 'center', text: '惠帝恍然大悟。后来百姓传唱：「萧何为法，顜若画一；曹参代之，守而勿失。载其清净，民以宁一。」——这就是成语「萧规曹随」。' }
  ];
  var sceneIndex = 0;
  var speechEl = $('#speech');
  var speechText = $('#speechText');
  var speechWho = $('#speechWho');
  var actorLeft = $('#actorLeft');
  var actorRight = $('#actorRight');
  var sceneDots = $('#sceneDots');
  var btnNextScene = $('#btnNextScene');

  scenes.forEach(function (_, i) {
    var s = document.createElement('span');
    sceneDots.appendChild(s);
  });
  var sceneDotEls = $$('span', sceneDots);

  function setSpeakers(side) {
    actorLeft.classList.toggle('speaking', side === 'left');
    actorRight.classList.toggle('speaking', side === 'right');
    actorLeft.classList.toggle('inactive', side === 'right');
    actorRight.classList.toggle('inactive', side === 'left');
    speechEl.classList.toggle('right', side === 'right');
  }

  function showScene(i) {
    var sc = scenes[i];
    speechText.textContent = sc.text;
    speechWho.textContent = sc.who;
    setSpeakers(sc.side);
    speechEl.classList.remove('show');
    void speechEl.offsetWidth; /* 强制重排，让动画重新播放 */
    speechEl.classList.add('show');
    sceneDotEls.forEach(function (d, j) {
      d.classList.toggle('done', j < i);
      d.classList.toggle('current', j === i);
    });
    btnNextScene.textContent = i === scenes.length - 1 ? '看完了 ↺ 重播' : '下一幕 ▶';
  }

  btnNextScene.addEventListener('click', function () {
    sceneIndex = (sceneIndex + 1) % scenes.length;
    showScene(sceneIndex);
  });
  $('#btnResetTheater').addEventListener('click', function () {
    sceneIndex = 0;
    showScene(0);
  });
  showScene(0);

  /* ---------- 10. 金句卡翻转 ---------- */
  $$('.quote-card').forEach(function (card) {
    function flip() { card.classList.toggle('flipped'); }
    card.addEventListener('click', flip);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });

  /* ---------- 11. 现代应用 tabs ---------- */
  var applyTabs = $$('.apply-tab');
  var applyPanels = $$('.apply-panel');
  applyTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      applyTabs.forEach(function (t) { t.classList.toggle('active', t === tab); });
      applyPanels.forEach(function (p) { p.classList.toggle('active', p.dataset.panel === tab.dataset.tab); });
    });
  });

  /* ---------- 12. 小测验 ---------- */
  var quizQuestions = $$('.quiz-question');
  var quizResult = $('#quizResult');
  var quizScore = $('#quizScore');
  var quizComment = $('#quizComment');
  var quizReview = $('#quizReview');
  var answered = 0;
  var correct = 0;
  var wrongList = [];
  var explains = {
    '1': '「无为」是不妄为、不折腾。该干的照干——大禹为了治水可挖了 13 年渠道，一点都不懒。',
    '2': '韩非子注：「烹小鲜而数挠之，则贼其泽；治大国而数变法，则民苦之」——老翻鱼，鱼就烂；老改政策，百姓就苦。',
    '3': '孟子：「禹之行水也，行其所无事也」——顺着水性给水找出路，不用蛮力跟自然硬刚。',
    '4': '文景之治的秘诀就是「轻徭薄赋、与民休息」：田税降到三十税一，文帝十三年还全免田租，汉文帝自己连新衣服都舍不得做。',
    '5': '庖丁说：「依乎天理，批大郤，导大窾」——顺着骨节间的空隙下刀。「以无厚入有间，游刃必有余地」。',
    '6': '《史记·老子韩非列传》：「老子者……周守藏室之史也」——相当于周朝的国家图书馆兼档案馆馆长。',
    '7': '《道德经》第17章：「太上，不知有之……功成事遂，百姓皆谓我自然」——最好的领导，大家甚至感觉不到他在指手画脚。',
    '8': '《道德经》第57章：「我无为，而民自化；我好静，而民自正；我无事，而民自富；我无欲，而民自朴。」'
  };

  quizQuestions.forEach(function (q) {
    var qNum = q.dataset.q;
    var opts = $$('.quiz-opt', q);
    var explain = $('.quiz-explain', q);
    opts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        if (q.classList.contains('done')) return;
        q.classList.add('done');
        var isCorrect = opt.dataset.correct === 'true';
        opts.forEach(function (o) { o.disabled = true; });
        opt.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) {
          opts.forEach(function (o) {
            if (o.dataset.correct === 'true') o.classList.add('correct');
          });
          wrongList.push({ num: qNum, title: $('.quiz-title', q).textContent.trim() });
        }
        explain.textContent = '💡 ' + explains[qNum];
        explain.classList.add('show');
        answered++;
        if (isCorrect) correct++;
        if (answered === quizQuestions.length) showResult();
      });
    });
  });

  function showResult() {
    var total = quizQuestions.length;
    var pct = correct / total;
    var badge = pct === 1 ? '🏅 得道高人' : (pct >= 0.75 ? '🎓 进士及第' : (pct >= 0.5 ? '📖 秀才' : '🌱 学徒'));
    var comment;
    if (correct === total) comment = '满分！你已经把「无为而治」学明白了：守规律、少折腾、该干则干。可以去给别人讲课啦 🎉';
    else if (pct >= 0.75) comment = '很不错！再翻一翻上面的「金句卡」，就彻底通透啦 👍';
    else if (pct >= 0.5) comment = '及格啦！回「烹小鲜」「庖丁解牛」和「大禹治水」三节再玩一遍，秒懂 🙂';
    else comment = '别灰心！把页面从头再玩一遍，重点看动画演示——傻子都能学会，你更没问题 💪';
    quizScore.textContent = badge + ' · 得分：' + correct + ' / ' + total;
    quizComment.textContent = comment;
    if (wrongList.length) {
      var links = wrongList.map(function (item) {
        return '<a href="#" data-jump="' + item.num + '">第' + item.num + '题「' + item.title.slice(0, 14) + '…」</a>';
      }).join('<br>');
      quizReview.innerHTML = '💡 答错的题，回头再看一遍：<br>' + links;
      $$('a[data-jump]', quizReview).forEach(function (a) {
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var qEl = document.querySelector('.quiz-question[data-q="' + a.dataset.jump + '"]');
          if (qEl) qEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      });
    } else {
      quizReview.innerHTML = '';
    }
    quizResult.classList.add('on');
    quizResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------- 13. 深色模式 ---------- */
  var darkToggle = $('#darkToggle');
  var darkMedia = window.matchMedia('(prefers-color-scheme: dark)');
  function applyDark(dark) {
    document.body.classList.toggle('dark', dark);
    darkToggle.textContent = dark ? '☀️' : '🌙';
    darkToggle.title = dark ? '切换到浅色模式' : '切换到深色模式';
  }
  var storedDark = null;
  try { storedDark = localStorage.getItem('tao-dark'); } catch (e) {}
  if (storedDark === 'dark') applyDark(true);
  else if (storedDark === 'light') applyDark(false);
  else applyDark(darkMedia.matches);
  darkToggle.addEventListener('click', function () {
    var next = !document.body.classList.contains('dark');
    applyDark(next);
    try { localStorage.setItem('tao-dark', next ? 'dark' : 'light'); } catch (e) {}
  });
  darkMedia.addEventListener('change', function (e) {
    var stored = null;
    try { stored = localStorage.getItem('tao-dark'); } catch (err) {}
    if (!stored) applyDark(e.matches);
  });

  /* ---------- 14. 章节朗读 ---------- */
  var ttsBtns = $$('.tts-btn');
  var currentUtterance = null;
  function stopTts() {
    if (currentUtterance && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    currentUtterance = null;
    ttsBtns.forEach(function (b) { b.classList.remove('speaking'); b.textContent = '🔊 听讲解'; });
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = function () {};
    ttsBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.dataset.tts);
        if (!target) return;
        var txtEl = target.querySelector('.tts-text');
        if (!txtEl) return;
        if (btn.classList.contains('speaking')) { stopTts(); return; }
        var text = txtEl.textContent.trim();
        if (!text) return;
        var u = new SpeechSynthesisUtterance(text);
        u.lang = 'zh-CN';
        u.rate = 1;
        var voices = window.speechSynthesis.getVoices();
        var zh = null;
        for (var i = 0; i < voices.length; i++) {
          if (voices[i].lang && voices[i].lang.toLowerCase().indexOf('zh') === 0) { zh = voices[i]; break; }
        }
        if (zh) u.voice = zh;
        u.onend = function () { btn.classList.remove('speaking'); btn.textContent = '🔊 听讲解'; currentUtterance = null; };
        u.onerror = function () { btn.classList.remove('speaking'); btn.textContent = '🔊 听讲解'; currentUtterance = null; };
        stopTts();
        currentUtterance = u;
        btn.classList.add('speaking');
        btn.textContent = '⏹ 停止朗读';
        window.speechSynthesis.speak(u);
      });
    });
  } else {
    ttsBtns.forEach(function (b) { b.classList.add('off'); b.title = '当前浏览器不支持语音朗读'; });
  }

  /* ---------- 15. 庖丁解牛 ---------- */
  var butcherStage = $('#butcherStage');
  var knifeEl = $('.knife', butcherStage);
  var butcherResult = $('#butcherResult');
  var butcherFeedback = $('#butcherFeedback');
  var btnSlice = $('#btnSlice');
  var btnChop = $('#btnChop');
  var btnResetButcher = $('#btnResetButcher');
  var butcherBusy = false;

  var slicePath = [[150, 60], [285, 150], [330, 210], [430, 160], [515, 195], [640, 265]];
  var chopBase = { x: 495, y: 95 };

  function setKnife(x, y, deg) {
    knifeEl.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + deg + 'deg)';
  }
  function resetButcher() {
    butcherBusy = false;
    butcherStage.classList.remove('sliced', 'chopping', 'notched');
    setKnife(150, 60, 30);
    butcherResult.textContent = '选一种刀法试试';
    butcherFeedback.textContent = '牛身上有天然的「纹理空隙」，骨头硬、缝隙软——看你怎么下刀。';
  }
  btnResetButcher.addEventListener('click', resetButcher);

  function tweenKnife(points, duration, onDone) {
    var t0 = null;
    var segs = [];
    var total = 0;
    for (var i = 0; i < points.length - 1; i++) {
      var dx = points[i + 1][0] - points[i][0];
      var dy = points[i + 1][1] - points[i][1];
      var len = Math.sqrt(dx * dx + dy * dy);
      segs.push({ a: points[i], b: points[i + 1], len: len });
      total += len;
    }
    function step(ts) {
      if (t0 === null) t0 = ts;
      var el = Math.min(1, (ts - t0) / duration);
      var d = el * total;
      var acc = 0;
      for (var i = 0; i < segs.length; i++) {
        if (d <= acc + segs[i].len || i === segs.length - 1) {
          var f = segs[i].len > 0 ? (d - acc) / segs[i].len : 0;
          var x = segs[i].a[0] + (segs[i].b[0] - segs[i].a[0]) * f;
          var y = segs[i].a[1] + (segs[i].b[1] - segs[i].a[1]) * f;
          var ang = Math.atan2(segs[i].b[1] - segs[i].a[1], segs[i].b[0] - segs[i].a[0]) * 180 / Math.PI - 90;
          setKnife(x, y, ang);
          break;
        }
        acc += segs[i].len;
      }
      if (el < 1) requestAnimationFrame(step);
      else if (onDone) onDone();
    }
    requestAnimationFrame(step);
  }

  btnSlice.addEventListener('click', function () {
    if (butcherBusy) return;
    resetButcher();
    butcherBusy = true;
    butcherResult.textContent = '顺着纹理，游刃有余……';
    butcherFeedback.textContent = '刀刃从「空隙」里滑过去，不碰骨头……';
    tweenKnife(slicePath, 2400, function () {
      butcherStage.classList.add('sliced');
      butcherResult.textContent = '砉然已解，如土委地 ✨';
      butcherFeedback.innerHTML = '牛轻松分成几块，刀完好无损——<strong>「以无厚入有间，游刃必有余地」</strong>。这把刀用了 19 年还像新磨的。';
      butcherBusy = false;
    });
  });

  btnChop.addEventListener('click', function () {
    if (butcherBusy) return;
    resetButcher();
    butcherBusy = true;
    butcherStage.classList.add('chopping');
    butcherResult.textContent = '咣！咣！咣！';
    butcherFeedback.textContent = '跟「肯綮」（骨节）硬碰硬……';
    var hops = 3;
    var i = 0;
    function hop() {
      if (i >= hops) {
        butcherStage.classList.remove('chopping');
        butcherStage.classList.add('notched');
        butcherResult.textContent = '刀卷刃了 😖';
        butcherFeedback.innerHTML = '「族庖月更刀，折也」——普通厨子硬砍骨头，<strong>一个月就要换一把刀</strong>。力气花十倍，结果最差。';
        butcherBusy = false;
        return;
      }
      tweenKnife([[chopBase.x, chopBase.y], [chopBase.x, 185], [chopBase.x, chopBase.y]], 300, function () {
        i++;
        hop();
      });
    }
    hop();
  });
  resetButcher();

  /* ---------- 13. 回到顶部 ---------- */
  $('#backTop').addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 全局滚动监听 ---------- */
  window.addEventListener('scroll', function () {
    updateProgress();
    onScroll();
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
  parallax();
})();
