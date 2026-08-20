// Branching dialogue tree for the front-desk receptionist NPC.
// Each node: speaker, text, and choices[] (label, next node id, optional effect(gameState)).
export const dialogueTree = {
  start: {
    speaker: "前台接待",
    text: "晚上好,访客登记已经截止了。请问你有预约吗?",
    choices: [
      {
        label: "我对大厅里的那件古董感兴趣,能聊聊吗?",
        next: "artifact",
        effect: (gs) => (gs.flags.askedAboutArtifact = true),
      },
      {
        label: "我是新来的技术员,需要去后台检查设备。",
        next: "lie_id",
      },
      {
        label: "没事,我再看看。(结束对话)",
        next: null,
      },
    ],
  },

  artifact: {
    speaker: "前台接待",
    text: "哦,你也注意到了?那是老馆长收藏的机械装置,据说密码就刻在三张展示卡的边缘,只是没人凑齐过。",
    choices: [
      {
        label: "谢谢提醒,我去找找看。",
        next: null,
      },
      {
        label: "顺便问一下,今晚的巡逻安排是怎样的?",
        next: "distract",
      },
    ],
  },

  lie_id: {
    speaker: "前台接待",
    text: "技术员？我这边没有排班记录呢。能出示一下工牌吗?",
    choices: [
      {
        label: "抱歉,工牌落在车里了,能通融一下吗?",
        next: "lie_fail",
      },
      {
        label: "……其实我不是技术员,只是路过随便问问。",
        next: "honest_retreat",
      },
    ],
  },

  lie_fail: {
    speaker: "前台接待",
    text: "没有工牌可不行,这样吧——我假装没看到,但保安那边我可不敢打包票,你自己小心点。",
    choices: [
      {
        label: "明白了,谢谢。",
        next: null,
        effect: (gs) => (gs.flags.liedAboutId = true),
      },
    ],
  },

  honest_retreat: {
    speaker: "前台接待",
    text: "呵,老实人。行吧,晚上巡逻的保安有点懒散,绕柱子那条路他很少走,你自己看着办。",
    choices: [
      {
        label: "了解,谢谢提醒。",
        next: null,
        effect: (gs) => (gs.flags.guardDistracted = true),
      },
    ],
  },

  distract: {
    speaker: "前台接待",
    text: "巡逻的哥们儿最近总盯着大厅那台老电视看球赛,我给他调大点音量,他能分神好一阵子。",
    choices: [
      {
        label: "太好了,拜托你了。",
        next: null,
        effect: (gs) => (gs.flags.guardDistracted = true),
      },
    ],
  },
};
