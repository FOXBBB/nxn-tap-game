/* ============== NXN GAME STRICT COMMENTARY ONBOARDING (FINAL) ============== */

(function () {
  const root = document.getElementById("nxn-tutorial-root");
  let step = -1;
  let lang = "RU";

  const TEXT = {
    RU: {
      tap: {
        title: "Тап",
        text: "Нажимай на монету, чтобы зарабатывать NXN. Каждый тап приносит монеты."
      },
      energy: {
        title: "Энергия",
        text: "Каждый тап тратит энергию. Когда энергия закончится, тапы временно остановятся."
      },
      lbMenu: {
        title: "Лидерборд",
        text: "Нажми на эту иконку, чтобы посмотреть рейтинг игроков."
      },
      lbScreen: {
        title: "Рейтинг игроков",
        text: "Здесь ты видишь общий рейтинг всех игроков. Поднимайся выше, зарабатывая NXN."
      },
      transferMenu: {
        title: "Переводы",
        text: "Нажми сюда, чтобы перейти к переводам NXN."
      },
      transferScreen: {
        title: "Переводы NXN",
        text: "Отправляй NXN другим игрокам по их ID."
      },
      shopMenu: {
        title: "Магазин",
        text: "Нажми сюда, чтобы открыть магазин улучшений."
      },
      shopScreen: {
        title: "Магазин улучшений",
        text: "Улучши силу тапа, энергию и покупай автокликер."
      },
      tapMenu: {
        title: "Главный экран",
        text: "Нажми сюда, чтобы вернуться к тапалке."
      },
      stakeBtn: {
        title: "Стейк",
        text: "Нажми сюда, чтобы участвовать в наградных циклах."
      },
      stakeMain: {
        title: "Стейк NXN",
        text: "Выбери сумму и застейкай NXN для участия в наградном цикле."
      },
      stakeRef: {
        title: "Реферальный стейк",
        text: "Реферальные NXN можно использовать только для стейка."
      },
      stakeLB: {
        title: "Стейк-лидерборд",
        text: "Здесь отображается рейтинг участников стейка и награды текущего цикла."
      },
      referralMenu: {
        title: "Рефералы",
        text: "Нажми сюда, чтобы перейти в реферальный раздел."
      },
      referralScreen: {
        title: "Реферальная программа",
        text:
          "Делитесь своим реферальным кодом и приглашайте друзей.\n\n" +
          "Вы и ваш друг получите по 50 000 NXN, которые можно использовать для стейка."
      },
      finish: {
  title: "Готово",
  text: "Теперь ты готов. Сделай первый тап и начинай зарабатывать NXN."
}

    },

    EN: {
      tap: {
        title: "Tap",
        text: "Tap the coin to earn NXN. Each tap gives you coins."
      },
      energy: {
        title: "Energy",
        text: "Each tap consumes energy. When energy runs out, taps will stop."
      },
      lbMenu: {
        title: "Leaderboard",
        text: "Tap this icon to view the global leaderboard."
      },
      lbScreen: {
        title: "Global Ranking",
        text: "This is the global ranking of all players. Compete and climb higher."
      },
      transferMenu: {
        title: "Transfers",
        text: "Tap here to open the transfer section."
      },
      transferScreen: {
        title: "NXN Transfers",
        text: "Send NXN to other players using their ID."
      },
      shopMenu: {
        title: "Shop",
        text: "Tap here to open the upgrade shop."
      },
      shopScreen: {
        title: "Upgrades Shop",
        text: "Upgrade tap power, energy, and buy autoclicker."
      },
      tapMenu: {
        title: "Main Screen",
        text: "Tap here to return to the main tap screen."
      },
      stakeBtn: {
        title: "Stake",
        text: "Tap here to participate in reward cycles."
      },
      stakeMain: {
        title: "NXN Staking",
        text: "Choose an amount and stake NXN to join the reward cycle."
      },
      stakeRef: {
        title: "Referral Stake",
        text: "Referral NXN can only be used for staking."
      },
      stakeLB: {
        title: "Stake Leaderboard",
        text: "This leaderboard shows top stakers and cycle rewards."
      },
      referralMenu: {
        title: "Referrals",
        text: "Tap here to open the referral section."
      },
      referralScreen: {
        title: "Referral Program",
        text:
          "Share your referral code and invite friends.\n\n" +
          "You and your friend will receive 50,000 NXN each for staking."
      },
      finish: {
  title: "All Set",
  text: "You are ready. Make your first tap and start earning NXN."
}

    },

    TR: {
      tap: {
        title: "Dokun",
        text: "NXN kazanmak için coin'e dokun."
      },
      energy: {
        title: "Enerji",
        text: "Her dokunuş enerji harcar. Enerji bitince durur."
      },
      lbMenu: {
        title: "Sıralama",
        text: "Genel sıralamayı görmek için buraya dokun."
      },
      lbScreen: {
        title: "Oyuncu Sıralaması",
        text: "Tüm oyuncuların genel sıralaması burada gösterilir."
      },
      transferMenu: {
        title: "Transfer",
        text: "Transfer bölümüne girmek için buraya dokun."
      },
      transferScreen: {
        title: "NXN Transfer",
        text: "NXN’i diğer oyunculara gönder."
      },
      shopMenu: {
        title: "Mağaza",
        text: "Yükseltme mağazasını aç."
      },
      shopScreen: {
        title: "Yükseltmeler",
        text: "Dokunma gücünü ve enerjini yükselt."
      },
      tapMenu: {
        title: "Ana Ekran",
        text: "Ana tap ekranına dönmek için buraya dokun."
      },
      stakeBtn: {
        title: "Stake",
        text: "Ödül döngülerine katılmak için stake et."
      },
      stakeMain: {
        title: "NXN Stake",
        text: "Bir miktar seç ve stake et."
      },
      stakeRef: {
        title: "Referans Stake",
        text: "Referans NXN sadece stake için kullanılabilir."
      },
      stakeLB: {
        title: "Stake Sıralaması",
        text: "En iyi stake yapan oyuncular burada gösterilir."
      },
      referralMenu: {
        title: "Referans",
        text: "Referans bölümüne git."
      },
      referralScreen: {
        title: "Referans Programı",
        text:
          "Referans kodunu paylaş ve arkadaşlarını davet et.\n\n" +
          "Sen ve arkadaşın stake için 50.000 NXN kazanırsınız."
      },
      finish: {
  title: "Hazır",
  text: "Hazırsın. İlk dokunuşunu yap ve NXN kazanmaya başla."
}

    }
  };

  function unlockAll() {
    document.body.classList.remove("tutorial-lock");
    root.innerHTML = "";
  }

  function showCenter({ title, text, play }) {
    root.innerHTML = `
      <div class="nxn-comment nxn-center">
        <div class="nxn-comment-title">${title}</div>
        <div class="nxn-comment-text">${text.replace(/\n/g, "<br>")}</div>
        <div class="nxn-comment-actions">
          <button class="nxn-comment-btn primary">${play}</button>
        </div>
      </div>
    `;

    document.querySelector(".nxn-comment-btn").onclick = unlockAll;
  }

  window.startNXNTutorial = function () {
  const coin = document.getElementById("coin");
  const root = document.getElementById("nxn-tutorial-root");

  // показываем финальный комментарий над монетой
  root.innerHTML = "";
  document.body.classList.add("tutorial-lock");

  coin.classList.add("allow-click");

  const box = document.createElement("div");
  box.className = "nxn-comment big";

  box.innerHTML = `
    <div class="nxn-comment-title">${TEXT[lang].finish.title}</div>
    <div class="nxn-comment-text">
      ${TEXT[lang].finish.text}
    </div>
  `;

  const r = coin.getBoundingClientRect();
  box.style.top = `${r.top - 140}px`;
  box.style.left = `${Math.max(12, r.left)}px`;

  root.appendChild(box);

  // ждём финальный тап
  coin.addEventListener(
    "pointerdown",
    () => {
      // полностью закрываем туториал
      document.body.classList.remove("tutorial-lock");
      coin.classList.remove("allow-click");
      root.innerHTML = "";
    },
    { once: true }
  );
};

})();
