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
  var answered = 0;
  var correct = 0;
  var explains = {
    '1': '「无为」是不妄为、不折腾。该干的照干——大禹为了治水可挖了 13 年渠道，一点都不懒。',
    '2': '韩非子注：「烹小鲜而数挠之，则贼其泽；治大国而数变法，则民苦之」——老翻鱼，鱼就烂；老改政策，百姓就苦。',
    '3': '孟子：「禹之行水也，行其所无事也」——顺着水性给水找出路，不用蛮力跟自然硬刚。',
    '4': '文景之治的秘诀就是「轻徭薄赋、与民休息」：田税降到三十税一，文帝十三年还全免田租，汉文帝自己连新衣服都舍不得做。'
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
    var comment;
    if (correct === 4) comment = '满分！你已经把「无为而治」学明白了：守规律、少折腾、该干则干。可以去给别人讲课啦 🎉';
    else if (correct === 3) comment = '很不错！再翻一翻上面的「金句卡」，就彻底通透啦 👍';
    else if (correct === 2) comment = '及格啦！回「烹小鲜」和「大禹治水」两节再玩一遍，秒懂 🙂';
    else comment = '别灰心！把页面从头再玩一遍，重点看「大禹治水」和「文景之治」——傻子都能学会，你更没问题 💪';
    quizScore.textContent = '得分：' + correct + ' / ' + quizQuestions.length;
    quizComment.textContent = comment;
    quizResult.classList.add('on');
    quizResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

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
