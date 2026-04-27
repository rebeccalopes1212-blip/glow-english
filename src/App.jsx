import { useState, useEffect, useRef, useCallback } from "react";

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
  :root {
    --cream:#F7F3EC; --offwhite:#FAFAF7; --w100:#EDE8DE; --w200:#D9D2C5;
    --w300:#B5ADA0; --w400:#8A8278;
    --teal:#0D6B6B; --teal-l:#1A8080; --teal-pale:#E8F2F2; --teal-mid:#C2DEDE;
    --gold:#C9A96E; --tp:#2A2520; --ts:#7A7268; --tm:#A8A098;
    --s2:0 4px 32px rgba(42,37,32,.09);
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--cream);}
  .wrap{font-family:'DM Sans',sans-serif;background:var(--cream);color:var(--tp);max-width:430px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;position:relative;}
  .page-scroll{flex:1;overflow-y:auto;padding-bottom:80px;}
  .nav-fixed{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;z-index:150;}
  .ser{font-family:'Cormorant Garamond',serif;}
  .card{background:var(--offwhite);border-radius:16px;box-shadow:var(--s2);border:1px solid var(--w100);overflow:hidden;}
  @keyframes fuUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes waveAnim{0%{transform:scaleY(0.3)}50%{transform:scaleY(1)}100%{transform:scaleY(0.3)}}
  @keyframes dotB{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)}}
  @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(13,107,107,.4)}50%{box-shadow:0 0 0 9px rgba(13,107,107,0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes prog{from{width:0%}to{width:100%}}
  @keyframes sheetUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes glowPulse{0%,100%{box-shadow:0 0 0 0 rgba(201,169,110,.5)}60%{box-shadow:0 0 0 10px rgba(201,169,110,0)}}
  @keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1}100%{transform:translateY(-60px) rotate(360deg);opacity:0}}
  .f1{animation:fuUp .45s ease .06s both}.f2{animation:fuUp .45s ease .14s both}
  .f3{animation:fuUp .45s ease .22s both}.f4{animation:fuUp .45s ease .30s both}
  .f5{animation:fuUp .45s ease .38s both}
  ::-webkit-scrollbar{width:0;}
  textarea{resize:none;font-family:'DM Sans',sans-serif;}
  button{cursor:pointer;}
  input[type=password],input[type=text]{font-family:'DM Sans',sans-serif;}
`;

// ─── MAKE.COM WEBHOOK ─────────────────────────────────────────────────────────
// Cole aqui a URL do seu webhook no Make.com.
// O webhook deve retornar JSON com um dos campos: { response, text, message, reply, content }
const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/jakkvr6fri2v82miak1uuptwnrxpuvhd";

// ─── DATA ─────────────────────────────────────────────────────────────────────
const MISSIONS = [
  { id:1, text:"Simular check-in de hotel",        tag:"Speaking",   xp:"+15 XP", done:false },
  { id:2, text:"Aprender 3 gírias de business",     tag:"Vocabulary", xp:"+10 XP", done:true  },
  { id:3, text:"Corrigir 5 erros de gramática",     tag:"Grammar",    xp:"+10 XP", done:true  },
  { id:4, text:"Escutar podcast por 5 minutos",     tag:"Listening",  xp:"+20 XP", done:false },
  { id:5, text:"Escrever daily email profissional", tag:"Writing",    xp:"+15 XP", done:false },
];
const BOARD = [
  { rank:1,  name:"Isabela M.", score:4820, streak:"12d", bg:"#0D6B6B", ini:"IM" },
  { rank:2,  name:"Rafael S.",  score:4410, streak:"9d",  bg:"#7C6B55", ini:"RS" },
  { rank:3,  name:"Beatriz C.", score:3990, streak:"7d",  bg:"#9AA0A6", ini:"BC" },
  { rank:4,  name:"Carlos A.",  score:3670, streak:"11d", bg:"#4E8FAB", ini:"CA" },
  { rank:5,  name:"Você",       score:3450, streak:"7d",  bg:"#0D6B6B", ini:"RB", me:true },
  { rank:6,  name:"Mariana L.", score:3100, streak:"5d",  bg:"#B07A5A", ini:"ML" },
  { rank:7,  name:"Diego F.",   score:2880, streak:"4d",  bg:"#6B7A8D", ini:"DF" },
  { rank:8,  name:"Thais R.",   score:2650, streak:"6d",  bg:"#8B6B9A", ini:"TR" },
  { rank:9,  name:"Lucas P.",   score:2340, streak:"3d",  bg:"#6B8B6B", ini:"LP" },
  { rank:10, name:"Ana B.",     score:2100, streak:"2d",  bg:"#9A7B6B", ini:"AB" },
];
const WEEK = [
  { day:"SEG", val:90 }, { day:"TER", val:65 }, { day:"QUA", val:100 },
  { day:"QUI", val:80 }, { day:"SEX", val:55 },
  { day:"SÁB", val:72, today:true },
  { day:"DOM", val:0,  future:true },
];

// ─── 🏆 PRIZE CONFIG — edite aqui a cada mês/semana ──────────────────────────
// Troque os valores abaixo para atualizar o prêmio em toda a plataforma.
const PRIZE = {
  period:  "Maio 2026",          // Ex: "Semana 17" ou "Maio 2026"
  type:    "mensal",             // "mensal" | "semanal"
  title:   "Vale-Presente Amazon",
  value:   "R$ 300",
  emoji:   "🎁",
  detail:  "Para o 1º lugar no ranking do mês",
  secondPrize: "R$ 150 · 2º lugar",
  thirdPrize:  "R$ 75 · 3º lugar",
  resetIn: "12 dias",            // texto livre
  color1:  "#C9A96E",            // gradiente do banner
  color2:  "#A07840",
};

// ─── LEARN MODULES ────────────────────────────────────────────────────────────
const LEARN_MODULES = [
  {
    id:"fundamentos", label:"Fundamentos", level:"A1–A2",
    icon:"🔤", color:"#C9A96E", lessons:4, done:0,
    desc:"Os sons que separam iniciantes de falantes confiantes.",
    lessons_list:[
      { id:1, title:"O Segredo da Língua (Som de TH)", duration:"6 min", type:"pronunciation", xp:50, done:false,
        video:"https://www.youtube.com/embed/nlKNo1TGALA",
        content:{
          intro:"O TH é o som que mais denuncia o sotaque brasileiro. Dominar isso muda tudo.",
          sections:[
            { type:"explanation", title:"Como fazer o TH",
              content:"O TH exige que a ponta da língua fique entre os dentes superiores e inferiores. Sopre o ar.\n\nSe soar como 'F', 'S', ou 'D', a posição está errada.\n\nMostre a língua sem medo para criar o atrito correto.\n\n🔊 Fala: \"THink\" — língua entre os dentes, sopra\n🔊 Fala: \"THe\" — língua entre os dentes, vibra" },
            { type:"vocabulary", title:"Pratique estas palavras", items:[
                "THINK 🔊 Fala: \"θɪŋk\" — pensar",
                "THREE 🔊 Fala: \"θriː\" — três",
                "THE 🔊 Fala: \"ðə\" — o/a",
                "THERAPY 🔊 Fala: \"ˈθɛrəpi\" — terapia",
                "THOUSAND 🔊 Fala: \"ˈθaʊzənd\" — mil",
              ]},
          ],
          practice:{ ariaCue:"Repeat this sentence clearly: 'I think that the therapy was worth three thousand dollars.' Focus on every TH sound! 🎙️", xpBonus:50 }
        }},
      { id:2, title:"A Elegância do Dark L", duration:"6 min", type:"pronunciation", xp:50, done:false,
        video:"https://www.youtube.com/embed/oXkCbks8VXA",
        content:{
          intro:"No Brasil finalizamos palavras com som de 'U'. Em inglês o L final é diferente — e faz toda a diferença.",
          sections:[
            { type:"explanation", title:"O Dark L",
              content:"A ponta da língua deve subir e tocar atrás dos dentes da frente no final de sílabas. Sinta a tensão na garganta.\n\n🔊 Fala: \"call\" = \"kɔːl\" (não \"kau\")\n🔊 Fala: \"deal\" = \"diːl\" (não \"diu\")\n🔊 Fala: \"global\" = \"ˈɡloʊbəl\" (não \"globau\")" },
            { type:"vocabulary", title:"Palavras com Dark L", items:[
                "CALL 🔊 Fala: \"kɔːl\"",
                "GLOBAL 🔊 Fala: \"ˈɡloʊbəl\"",
                "DIGITAL 🔊 Fala: \"ˈdɪdʒɪtəl\"",
                "SCHOOL 🔊 Fala: \"skuːl\"",
                "CANCEL 🔊 Fala: \"ˈkænsəl\"",
              ]},
          ],
          practice:{ ariaCue:"Say this sentence: 'I will call the global digital school to cancel the deal.' Every L at the end must be pronounced! 🎙️", xpBonus:50 }
        }},
      { id:3, title:"O R Executivo vs O H Aspirado", duration:"6 min", type:"pronunciation", xp:50, done:false,
        video:"https://www.youtube.com/embed/vHzCnU3_nPs",
        content:{
          intro:"O R e o H em inglês são completamente diferentes do português. Errar esses dois sons é muito comum.",
          sections:[
            { type:"explanation", title:"R e H em inglês",
              content:"O R em inglês NUNCA arranha a garganta. Faça um bico sutil e puxe a língua para trás.\n🔊 Fala: \"right\" = \"raɪt\" (r retroflex, não rolado)\n\nO H inicial é apenas um suspiro suave, como o ar usado para limpar lentes de óculos.\n🔊 Fala: \"hard\" = \"hɑːrd\"\n🔊 Fala: \"here\" = \"hɪər\"" },
            { type:"vocabulary", title:"Pratique R e H", items:[
                "REPORTS 🔊 Fala: \"rɪˈpɔːrts\"",
                "READING 🔊 Fala: \"ˈriːdɪŋ\"",
                "HARD 🔊 Fala: \"hɑːrd\"",
                "HIGH 🔊 Fala: \"haɪ\"",
                "REALLY 🔊 Fala: \"ˈriːəli\"",
              ]},
          ],
          practice:{ ariaCue:"Say clearly: 'I have a really hard time reading high-level reports here.' Focus on the R and H sounds! 🎙️", xpBonus:50 }
        }},
      { id:4, title:"Lábios Selados (Final M)", duration:"6 min", type:"pronunciation", xp:50, done:false,
        video:"https://www.youtube.com/embed/dI4TmMEfp2w",
        content:{
          intro:"Dois erros clássicos dos brasileiros: o M final aberto e o som de 'ee' no final das palavras.",
          sections:[
            { type:"explanation", title:"M final e consoantes finais",
              content:"Em palavras que terminam com M, feche completamente os lábios na pronúncia.\n🔊 Fala: \"dream\" = \"driːm\" (lábios fecham no final)\n\nSe a palavra termina em consoante, NÃO adicione o som de 'ee'.\n🔊 Errado: \"lik-ee\" ✗\n🔊 Certo: \"like\" = \"laɪk\" ✓" },
            { type:"vocabulary", title:"Palavras com M final", items:[
                "DREAM 🔊 Fala: \"driːm\"",
                "TEAM 🔊 Fala: \"tiːm\"",
                "SYSTEM 🔊 Fala: \"ˈsɪstəm\"",
                "PREMIUM 🔊 Fala: \"ˈpriːmiəm\"",
                "SUPREME 🔊 Fala: \"suːˈpriːm\"",
              ]},
          ],
          practice:{ ariaCue:"Say this: 'My dream team works in a supreme and premium system.' Close your lips on every M! 🎙️", xpBonus:50 }
        }},
    ]
  },
  {
    id:"identidade", label:"Identidade & Alta Performance", level:"A2–B1",
    icon:"⚡", color:"#4E8FAB", lessons:4, done:0,
    desc:"Vocabulário de rotina, foco, saúde e mindset com Huberman e Jobs.",
    lessons_list:[
      { id:1, title:"A Arquitetura da Manhã (Huberman Lab)", duration:"7 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/kAOuzkI9LsI",
        content:{
          intro:"Uma rotina de alta performance dita o tom do dia. Aprenda com o neurocientista Andrew Huberman.",
          sections:[
            { type:"vocabulary", title:"Vocabulário de rotina matinal", items:[
                "MORNING ROUTINE 🔊 Fala: \"ˈmɔːrnɪŋ ruːˈtiːn\" — rotina matinal",
                "SUNLIGHT EXPOSURE 🔊 Fala: \"ˈsʌnlaɪt ɪkˈspoʊʒər\" — exposição à luz solar",
                "HYDRATION 🔊 Fala: \"haɪˈdreɪʃən\" — hidratação",
                "DELAY CAFFEINE 🔊 Fala: \"dɪˈleɪ kæˈfiːn\" — atrasar a cafeína",
                "CORTISOL PEAK 🔊 Fala: \"ˈkɔːrtɪsɒl piːk\" — pico de cortisol",
              ]},
          ],
          practice:{ ariaCue:"Tell me about your ideal morning routine using these words: sunlight exposure, hydration, and routine. 🎙️", xpBonus:50 }
        }},
      { id:2, title:"O Foco Absoluto (Deep Work)", duration:"7 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/t-ezOLT2Kv0",
        content:{
          intro:"A produtividade requer concentração imperturbável em blocos de 90 minutos.",
          sections:[
            { type:"vocabulary", title:"Vocabulário de produtividade", items:[
                "DEEP WORK 🔊 Fala: \"diːp wɜːrk\" — trabalho profundo",
                "TIME-BLOCKING 🔊 Fala: \"taɪm ˈblɒkɪŋ\" — bloqueio de tempo",
                "TOUCH BASE 🔊 Fala: \"tʌtʃ beɪs\" — entrar em contato",
                "DISTRACTION-FREE 🔊 Fala: \"dɪˈstrækʃən friː\" — sem distrações",
                "FLOW STATE 🔊 Fala: \"floʊ steɪt\" — estado de fluxo",
              ]},
          ],
          practice:{ ariaCue:"Say: 'I am currently in a deep work session. Let's touch base this afternoon.' Focus on natural rhythm! 🎙️", xpBonus:50 }
        }},
      { id:3, title:"Corpo como Máquina (Biohacking)", duration:"7 min", type:"vocabulary", xp:50, done:false,
        video:"https://www.youtube.com/embed/lXkD95iZwzU",
        content:{
          intro:"O Glow Up exige movimento e nutrição estratégica. Domine o vocabulário de fisiologia.",
          sections:[
            { type:"vocabulary", title:"Vocabulário fitness & saúde", items:[
                "STRENGTH TRAINING 🔊 Fala: \"strɛŋθ ˈtreɪnɪŋ\" — treinamento de força",
                "LEAN PROTEIN 🔊 Fala: \"liːn ˈproʊtiːn\" — proteína magra",
                "RECOVERY 🔊 Fala: \"rɪˈkʌvəri\" — recuperação",
                "MACROS 🔊 Fala: \"ˈmækroʊz\" — macronutrientes",
                "CONSISTENCY 🔊 Fala: \"kənˈsɪstənsi\" — consistência",
              ]},
          ],
          practice:{ ariaCue:"Say: 'Today I want to focus on strength training and prioritize lean protein.' 🎙️", xpBonus:50 }
        }},
      { id:4, title:"Mindset Resiliente (Steve Jobs)", duration:"8 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/EfAtsfOoh_M",
        content:{
          intro:"Verbalizar seus objetivos molda sua realidade. Aprenda com o lendário discurso de Steve Jobs em Stanford.",
          sections:[
            { type:"vocabulary", title:"Vocabulário de mindset", items:[
                "INTUITION 🔊 Fala: \"ˌɪntjuˈɪʃən\" — intuição",
                "COMMITMENT 🔊 Fala: \"kəˈmɪtmənt\" — compromisso",
                "GRATITUDE 🔊 Fala: \"ˈɡrætɪtjuːd\" — gratidão",
                "RESILIENCE 🔊 Fala: \"rɪˈzɪliəns\" — resiliência",
                "PURPOSEFUL 🔊 Fala: \"ˈpɜːrpəsfəl\" — com propósito",
              ]},
          ],
          practice:{ ariaCue:"Say: 'I am committed to following my intuition and practicing gratitude daily.' 🎙️", xpBonus:50 }
        }},
    ]
  },
  {
    id:"social", label:"Social & Luxo", level:"B1",
    icon:"✈️", color:"#7C8A6B", lessons:4, done:0,
    desc:"Viagens premium, fine dining, networking e concierge de alto padrão.",
    lessons_list:[
      { id:1, title:"No Ar com Exclusividade (Aviation)", duration:"7 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/oGR7dNydYUk",
        content:{
          intro:"Eleve seu vocabulário de turismo para o padrão luxo. Controle terminologias de aeroporto com assertividade.",
          sections:[
            { type:"vocabulary", title:"Vocabulário de aviação premium", items:[
                "BOARDING PASS 🔊 Fala: \"ˈbɔːrdɪŋ pæs\" — cartão de embarque",
                "PRIORITY LOUNGE 🔊 Fala: \"praɪˈɒrəti laʊndʒ\" — sala VIP",
                "CONNECTING FLIGHT 🔊 Fala: \"kəˈnɛktɪŋ flaɪt\" — voo de conexão",
                "COMPLIMENTARY UPGRADE 🔊 Fala: \"ˌkɒmplɪˈmɛntəri ˈʌpɡreɪd\" — upgrade cortesia",
                "AISLE SEAT 🔊 Fala: \"aɪl siːt\" — assento no corredor",
              ]},
          ],
          practice:{ ariaCue:"Say this confidently: 'Good morning. I would like to access the priority lounge before my connecting flight.' 🎙️", xpBonus:50 }
        }},
      { id:2, title:"O Paladar Refinado (Fine Dining)", duration:"7 min", type:"vocabulary", xp:50, done:false,
        video:"https://www.youtube.com/embed/Gx8eeoV40jQ",
        content:{
          intro:"A linguagem da hospitalidade premium é sutil. Substitua adjetivos básicos por palavras de alto padrão.",
          sections:[
            { type:"vocabulary", title:"Vocabulário fine dining", items:[
                "BESPOKE 🔊 Fala: \"bɪˈspoʊk\" — sob medida, exclusivo",
                "EXQUISITE 🔊 Fala: \"ɪkˈskwɪzɪt\" — requintado",
                "WINE PAIRING 🔊 Fala: \"waɪn ˈpɛərɪŋ\" — harmonização de vinhos",
                "TASTING MENU 🔊 Fala: \"ˈteɪstɪŋ ˈmɛnjuː\" — menu degustação",
                "SOMMELIER 🔊 Fala: \"ˌsɒməˈljeɪ\" — sommelier",
              ]},
          ],
          practice:{ ariaCue:"Say: 'We are looking for an exquisite and bespoke dining experience with a wine pairing.' 🎙️", xpBonus:50 }
        }},
      { id:3, title:"Magnetismo da Presença (Networking)", duration:"7 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/Tko7g0JJ52Y",
        content:{
          intro:"No networking global, o carisma inicial é fundamental. A fluidez social demonstra inteligência relacional.",
          sections:[
            { type:"vocabulary", title:"Expressões de networking", items:[
                "ON THE SAME WAVELENGTH 🔊 Fala: \"ɒn ðə seɪm ˈweɪvlɛŋθ\" — na mesma sintonia",
                "TOUCH BASE 🔊 Fala: \"tʌtʃ beɪs\" — entrar em contato",
                "BREAK THE ICE 🔊 Fala: \"breɪk ðə aɪs\" — quebrar o gelo",
                "MUTUAL CONNECTION 🔊 Fala: \"ˈmjuːtʃuəl kəˈnɛkʃən\" — conexão mútua",
                "FOLLOW UP 🔊 Fala: \"ˈfɒloʊ ʌp\" — dar seguimento",
              ]},
          ],
          practice:{ ariaCue:"Say naturally: 'It has been great chatting. We are on the same wavelength. Let's touch base next week.' 🎙️", xpBonus:50 }
        }},
      { id:4, title:"A Arte do Pedido (Concierge)", duration:"6 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/IMZoaNejsok",
        content:{
          intro:"Alta performance inclui a capacidade de transitar por cidades globais com elegância.",
          sections:[
            { type:"explanation", title:"Modais atenuadores para pedidos elegantes",
              content:"Use modais para fazer exigências firmes, porém educadas:\n\nCould you kindly... 🔊 Fala: \"kʊd juː ˈkaɪndli\"\nWould it be possible to... 🔊 Fala: \"wʊd ɪt biː ˈpɒsɪbəl tə\"\nI was wondering if... 🔊 Fala: \"aɪ wɒz ˈwʌndərɪŋ ɪf\"\n\nEstes são muito mais sofisticados que um simples \"please\"." },
          ],
          practice:{ ariaCue:"Say with confidence: 'Could you kindly arrange a private transfer to the corporate event tomorrow morning?' 🎙️", xpBonus:50 }
        }},
    ]
  },
  {
    id:"business", label:"Business English", level:"B1–B2",
    icon:"💼", color:"#0D6B6B", lessons:4, done:0,
    desc:"Autoridade, negociação, KPIs e roadmaps com Succession e Suits.",
    lessons_list:[
      { id:1, title:"O Vocabulário da Autoridade (Succession)", duration:"8 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/8k23Svzraik",
        content:{
          intro:"Líderes articulam estratégias focadas no futuro. Analise a dinâmica de poder na série Succession.",
          sections:[
            { type:"vocabulary", title:"Vocabulário de liderança", items:[
                "EMPOWER 🔊 Fala: \"ɪmˈpaʊər\" — empoderar, dar autonomia",
                "ALIGN 🔊 Fala: \"əˈlaɪn\" — alinhar",
                "STAKEHOLDERS 🔊 Fala: \"ˈsteɪkhoʊldərz\" — partes interessadas",
                "IMPLEMENT 🔊 Fala: \"ˈɪmplɪmɛnt\" — implementar",
                "STRATEGIC VISION 🔊 Fala: \"strəˈtiːdʒɪk ˈvɪʒən\" — visão estratégica",
              ]},
          ],
          practice:{ ariaCue:"Say with authority: 'We need to align with our stakeholders and implement this strategy efficiently.' 🎙️", xpBonus:50 }
        }},
      { id:2, title:"O Jogo de Xadrez (Suits)", duration:"8 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/NE7ULwzbLEk",
        content:{
          intro:"Negociações exigem o entendimento de limites. Observe Harvey Specter em Suits.",
          sections:[
            { type:"vocabulary", title:"Vocabulário de negociação", items:[
                "LEVERAGE 🔊 Fala: \"ˈlɛvərɪdʒ\" — vantagem, alavancagem",
                "DEALBREAKER 🔊 Fala: \"ˈdiːlbreɪkər\" — ponto inaceitável",
                "WIN-WIN 🔊 Fala: \"wɪn wɪn\" — vantajoso para ambos",
                "MIDDLE GROUND 🔊 Fala: \"ˈmɪdəl ɡraʊnd\" — meio-termo",
                "BOTTOM LINE 🔊 Fala: \"ˈbɒtəm laɪn\" — resultado final, ponto crucial",
              ]},
          ],
          practice:{ ariaCue:"Say: 'If we find a middle ground, it is a win-win. Otherwise, this point is a dealbreaker.' 🎙️", xpBonus:50 }
        }},
      { id:3, title:"Traduzindo Resultados (KPIs)", duration:"8 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/popKL2sWChg",
        content:{
          intro:"A comunicação corporativa baseia-se em métricas absolutas. Expresse crescimento com precisão.",
          sections:[
            { type:"vocabulary", title:"Vocabulário de métricas", items:[
                "KPIs 🔊 Fala: \"keɪ piː aɪz\" — Indicadores Chave de Desempenho",
                "EXCEEDED TARGETS 🔊 Fala: \"ɪkˈsiːdɪd ˈtɑːrɡɪts\" — superou metas",
                "OUTCOME 🔊 Fala: \"ˈaʊtkʌm\" — resultado",
                "EFFICIENCY 🔊 Fala: \"ɪˈfɪʃənsi\" — eficiência",
                "QUARTER (Q4) 🔊 Fala: \"ˈkwɔːrtər\" — trimestre",
              ]},
          ],
          practice:{ ariaCue:"Say clearly: 'Our Q4 KPIs exceeded targets, and the new system improved overall efficiency by thirty percent.' 🎙️", xpBonus:50 }
        }},
      { id:4, title:"O Caminho à Frente (Roadmaps)", duration:"8 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/COs11eucIC4",
        content:{
          intro:"A visão estratégica é apresentada através de etapas planejadas. Comunique a direção da sua equipe.",
          sections:[
            { type:"vocabulary", title:"Vocabulário de planejamento", items:[
                "ROADMAP 🔊 Fala: \"ˈroʊdmæp\" — mapa estratégico",
                "MILESTONES 🔊 Fala: \"ˈmaɪlstoʊnz\" — marcos, etapas-chave",
                "UPSKILLING 🔊 Fala: \"ˈʌpskɪlɪŋ\" — desenvolvimento de habilidades",
                "DELIVERABLES 🔊 Fala: \"dɪˈlɪvərəbəlz\" — entregáveis",
                "SCALABLE 🔊 Fala: \"ˈskeɪləbəl\" — escalável",
              ]},
          ],
          practice:{ ariaCue:"Say: 'Our strategic roadmap includes three major milestones and a focus on upskilling the staff.' 🎙️", xpBonus:50 }
        }},
    ]
  },
  {
    id:"estilo", label:"Estilo & Fluência", level:"B2–C1",
    icon:"✨", color:"#8B6B9A", lessons:4, done:0,
    desc:"Storytelling, idioms, diplomacia e poder vocal com O Diabo Veste Prada.",
    lessons_list:[
      { id:1, title:"O Poder da Narrativa (Storytelling)", duration:"8 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/uxU5xYbFDgg",
        content:{
          intro:"O carisma frequentemente reside em contar uma história envolvente. Use frameworks narrativos.",
          sections:[
            { type:"explanation", title:"Framework de storytelling",
              content:"Use esta estrutura para prender atenção:\n\n1. SITUAÇÃO: contextualize\n🔊 Fala: \"We were facing a major challenge...\"\n\n2. OBSTÁCULO: o problema\n🔊 Fala: \"The obstacle was...\"\n\n3. AÇÃO: o que você fez\n🔊 Fala: \"We took immediate action...\"\n\n4. RESULTADO: o desfecho\n🔊 Fala: \"...leading to a successful resolution.\"" },
          ],
          practice:{ ariaCue:"Tell me a mini story about a challenge you overcame using: obstacle, immediate action, successful resolution. 🎙️", xpBonus:50 }
        }},
      { id:2, title:"O Arsenal do Sucesso (Idioms)", duration:"8 min", type:"vocabulary", xp:50, done:false,
        video:"https://www.youtube.com/embed/3JjJpXrhI50",
        content:{
          intro:"Expressões idiomáticas sinalizam extrema fluência cultural e elevam seu discurso.",
          sections:[
            { type:"vocabulary", title:"Idioms de alto impacto", items:[
                "HIT THE JACKPOT 🔊 Fala: \"hɪt ðə ˈdʒækpɒt\" — dar sorte grande, acertar em cheio",
                "RISE TO THE OCCASION 🔊 Fala: \"raɪz tə ðə əˈkeɪʒən\" — estar à altura do desafio",
                "THINK OUTSIDE THE BOX 🔊 Fala: \"θɪŋk ˌaʊtˈsaɪd ðə bɒks\" — pensar criativamente",
                "ON THE SAME PAGE 🔊 Fala: \"ɒn ðə seɪm peɪdʒ\" — alinhados",
                "GO THE EXTRA MILE 🔊 Fala: \"ɡoʊ ðə ˈɛkstrə maɪl\" — fazer além do esperado",
              ]},
          ],
          practice:{ ariaCue:"Use at least 2 idioms in one sentence about your work: 'You really rose to the occasion. We hit the jackpot with this new global strategy.' 🎙️", xpBonus:50 }
        }},
      { id:3, title:"Inteligência Emocional (Diplomacy)", duration:"8 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/QmFoAw0bcto",
        content:{
          intro:"O domínio social inclui a desescalada de conflitos. Pratique a escuta ativa.",
          sections:[
            { type:"explanation", title:"Estruturas diplomáticas",
              content:"Discorde sem atacar — use estas estruturas:\n\n🔊 Fala: \"I understand your concern, but...\"\n🔊 Fala: \"That's a valid point. However...\"\n🔊 Fala: \"I see where you're coming from, and...\"\n🔊 Fala: \"Let's explore this from another angle...\"\n\nEstas frases mantêm o respeito enquanto você apresenta seu ponto." },
          ],
          practice:{ ariaCue:"Say diplomatically: 'I understand your concern completely, but let's explore this solution from another angle.' 🎙️", xpBonus:50 }
        }},
      { id:4, title:"O Fechamento Magnético (O Diabo Veste Prada)", duration:"9 min", type:"speaking", xp:50, done:false,
        video:"https://www.youtube.com/embed/_LOdvwh8W94",
        content:{
          intro:"A forma como você apresenta suas ideias define o seu valor. Analise Miranda Priestly.",
          sections:[
            { type:"explanation", title:"Presença vocal e poder",
              content:"Miranda Priestly usa restrição e controle vocal para projetar autoridade absoluta:\n\n• Fale devagar — cada palavra pesa\n🔊 Fala: \"I recommend we move forward...\" (pausas deliberadas)\n\n• Tom baixo = confiança alta\n• Evite subir o tom no final das frases (uptalk)\n\n• Vocabulário de autoridade:\n🔊 Fala: \"The data shows a clear path to success.\"\n🔊 Fala: \"This is not up for discussion.\"" },
          ],
          practice:{ ariaCue:"Say with full authority and slow pace: 'I recommend we move forward with this strategy, as the data shows a clear path to success.' 🎙️", xpBonus:50 }
        }},
    ]
  },
];
const VOICES = [
  { id:"21m00Tcm4TlvDq8ikWAM", name:"Rachel", desc:"Calm · Professional", gender:"♀" },
  { id:"EXAVITQu4vr4xnSDxMaL", name:"Bella",  desc:"Warm · Friendly",    gender:"♀" },
  { id:"AZnzlk1XvdvUeBnXmlld", name:"Domi",   desc:"Confident · Clear",  gender:"♀" },
  { id:"pNInz6obpgDQGcFmaJgB", name:"Adam",   desc:"Deep · Steady",      gender:"♂" },
];

// ─── LEVELS ───────────────────────────────────────────────────────────────────
const LEVELS = [
  { id:"A1", label:"A1 · Beginner",    color:"#B07A5A", rate:0.82,
    hint:"Fala simples + tradução PT-BR",
    sys:`You are Aria, a warm English coach. Student level: A1 Absolute Beginner.
RULES:
- Max 8 words per sentence.
- After each English sentence add Portuguese translation in parentheses.
- Correct mistakes gently in Portuguese: "Quase! O certo é: ..."
- Celebrate every small win.
- Focus: greetings, numbers, colors, basic present tense.
- End with ONE simple question for practice.
- Max 3 sentences total.
PRONUNCIATION RULE (mandatory): Whenever you introduce a new word or phrase, always add a pronunciation guide on the next line using this exact format:
🔊 Fala: "syl-LA-ble STRESS-ed like THIS"
Capitalize stressed syllables. Use hyphens between syllables. Example: "hello" → 🔊 Fala: "heh-LOH"` },

  { id:"A2", label:"A2 · Elementary",  color:"#9A7B6B", rate:0.88,
    hint:"Frases simples, suporte PT-BR",
    sys:`You are Aria, a warm English coach. Student level: A2 Elementary.
RULES:
- Simple sentences, max 12 words each.
- Translate difficult words only: (PT: palavra).
- Correct warmly: "Good try! It should be: ..."
- Focus: past simple, present continuous, everyday topics.
- Ask 1 follow-up question to keep practice going.
- Max 4 sentences.
PRONUNCIATION RULE (mandatory): For every new word or expression you teach, include a pronunciation guide immediately after it, on the same line or next line:
🔊 Fala: "syl-LA-ble STRESS-ed like THIS"
Capitalize stressed syllables. Hyphens between syllables. Example: "forty percent" → 🔊 Fala: "FOR-tee per-CENT"` },

  { id:"B1", label:"B1 · Intermediate",color:"#7C8A6B", rate:0.93,
    hint:"Inglês predominante, dicas pontuais",
    sys:`You are Aria, a professional English coach. Student level: B1 Intermediate.
RULES:
- Communicate almost entirely in English.
- Use Portuguese only for complex grammar concepts.
- Correct gently with a brief rule explanation.
- Introduce idioms and phrasal verbs with context.
- Focus: present perfect, conditionals, business basics, opinion expressions.
- Max 5 sentences.
PRONUNCIATION RULE (mandatory): Whenever you teach a word, idiom, or phrase, always include pronunciation on a new line:
🔊 Fala: "syl-LA-ble STRESS-ed"
Capitalize stressed syllables, hyphens between syllables. For multi-word expressions show each word: "increase in inquiries" → 🔊 Fala: "IN-creese in IN-kwai-reez"` },

  { id:"B2", label:"B2 · Upper-Int.",  color:"#4E8FAB", rate:0.96,
    hint:"100% English, cenários reais",
    sys:`You are Aria, an expert English coach. Student level: B2 Upper-Intermediate.
RULES:
- Communicate entirely in English.
- Point out formal vs informal register, American vs British differences.
- Introduce collocations, idioms, and business expressions naturally.
- Correct subtle grammar errors (articles, prepositions, tense consistency).
- Focus: professional communication, debate, complex storytelling.
- Give specific, actionable feedback.
- Max 6 sentences.
PRONUNCIATION RULE (mandatory): For every vocabulary item or expression you highlight, add a phonetic guide:
🔊 Fala: "syl-LA-ble STRESS-ed"
Use ALL-CAPS for primary stress, hyphens between syllables. Show rhythm for full phrases: "a forty percent increase in inquiries" → 🔊 Fala: "a FOR-tee per-CENT IN-creese in IN-kwai-reez"` },

  { id:"C1", label:"C1 · Advanced",   color:"#0D6B6B", rate:1.0,
    hint:"Nuance, estilo e precisão",
    sys:`You are Aria, a sophisticated English coach. Student level: C1 Advanced.
RULES:
- Use rich, varied vocabulary. Introduce sophisticated expressions.
- Critique word choice, register, and pragmatic appropriateness.
- Discuss subtle cultural references and connotations.
- Challenge with writing tasks, debates, and presentations.
- Focus: academic/business writing, C1 grammar (inversions, cleft sentences), rhetoric.
- Be direct and precise with feedback.
- Max 7 sentences.
PRONUNCIATION RULE (mandatory): Highlight connected speech, weak forms and stress shifts. For every notable word or phrase you introduce:
🔊 Fala: "syl-LA-ble STRESS-ed — note: [connected speech tip]"
Example: "I would have thought" (weak forms) → 🔊 Fala: "ai-wud-uv-THORT — the 'would have' reduces to 'wud-uv' in natural speech"` },

  { id:"C2", label:"C2 · Mastery",    color:"#2A2520", rate:1.0,
    hint:"Nível nativo — retórica e estilo",
    sys:`You are Aria, a master-level English consultant. Student level: C2 Mastery.
RULES:
- Engage as you would with a near-native speaker.
- Focus on the finest distinctions: connotation, register, rhythm, style.
- Reference literary and cultural touchstones where appropriate.
- Provide deep feedback on argumentation and rhetoric.
- Occasionally ask provocative questions to push critical thinking.
- Max 8 sentences.
PRONUNCIATION RULE (when relevant): For any pronunciation nuance worth noting — intonation patterns, stress for emphasis, reduction in connected speech — show it:
🔊 Fala: "full phrase here — [nuance note]"
Example: "I couldn't care LESS" (emphatic stress) → 🔊 Fala: "ai KUD-nt kare LESS — stress on 'less' signals contempt; 'I COULD-nt care less' is a common mispronunciation"` },
];
const GREETINGS = {
  A1:"Hello! I am Aria. (Olá! Eu sou Aria.) Ready? (Pronto?) 🌟",
  A2:"Hi! I'm Aria, your English coach. Let's practice some useful phrases today. What's your name? 😊",
  B1:"Hey! I'm Aria, your personal English coach. What would you like to practice today — speaking, writing, or grammar?",
  B2:"Welcome! I'm Aria. Let's get to it — business meeting simulation, writing feedback, or tricky grammar? What's on your agenda?",
  C1:"Good to have you here. I'm Aria. At your level the details matter — precision, register, fluency under pressure. Where do you want to push today?",
  C2:"Welcome. I'm Aria. At C2 we're mastering the art of communication itself. What shall we dissect today?",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const tnow = () => new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});

// Clean text for speech: remove PT translations, emojis, markdown
function cleanForSpeech(text) {
  return text
    .replace(/\(PT:.*?\)/g, "")
    .replace(/\([^)]{0,40}\)/g, "")      // remove short parentheticals
    .replace(/[\u{1F300}-\u{1FFFF}]/gu, "") // emojis
    .replace(/[*_`#]/g, "")
    .replace(/\s+/g, " ").trim();
}

// Split into sentences for chunked TTS
function toSentences(text) {
  return text.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()).filter(Boolean) || [text];
}

// ─── ELEVENLABS TTS ───────────────────────────────────────────────────────────
async function elevenLabsTTS(text, apiKey, voiceId, stability = 0.45, style = 0.30) {
  const clean = cleanForSpeech(text);
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: clean,
      model_id: "eleven_turbo_v2",
      voice_settings: { stability, similarity_boost: 0.78, style, use_speaker_boost: true },
    }),
  });
  if (!res.ok) throw new Error(`ElevenLabs error ${res.status}`);
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

// ─── IMPROVED WEB SPEECH (fallback) ──────────────────────────────────────────
function webSpeechSpeak(text, rate = 0.92, onStart, onEnd, onError) {
  const synth = window.speechSynthesis;
  synth.cancel();
  const sentences = toSentences(cleanForSpeech(text));
  const voices = synth.getVoices();
  const voice = voices.find(v => v.lang === "en-US" && (
    v.name.includes("Samantha") || v.name.includes("Karen") ||
    v.name.includes("Victoria") || v.name.includes("Moira") ||
    v.name.includes("Google US") || v.name.includes("Google UK")
  )) || voices.find(v => v.lang.startsWith("en-"));

  let idx = 0;
  onStart?.();

  function speakNext() {
    if (idx >= sentences.length) { onEnd?.(); return; }
    const utt = new SpeechSynthesisUtterance(sentences[idx]);
    utt.lang = "en-US";
    utt.rate = rate + (Math.random() * 0.06 - 0.03);   // subtle variation
    utt.pitch = 1.02 + (Math.random() * 0.08 - 0.04);  // subtle variation
    if (voice) utt.voice = voice;
    utt.onend = () => { idx++; setTimeout(speakNext, 160); }; // natural pause between sentences
    utt.onerror = () => { onError?.(); onEnd?.(); };
    synth.speak(utt);
  }
  speakNext();
  return () => synth.cancel();
}

// ─── WAVEFORM ─────────────────────────────────────────────────────────────────
function LiveWave({ playing, color = "var(--teal)", bars = 20 }) {
  const heights = [0.3,0.5,0.8,0.6,1,0.7,0.9,0.5,0.8,0.4,0.9,0.6,1,0.7,0.5,0.8,0.6,0.9,0.4,0.7];
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2, height:26 }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 3, background: color, flexShrink: 0, transformOrigin: "center",
          height: playing ? `${6 + heights[i % heights.length] * 18}px` : "4px",
          opacity: playing ? 0.85 + heights[i % heights.length] * 0.15 : 0.3,
          animation: playing ? `waveAnim ${0.5 + (i % 5) * 0.12}s ease-in-out infinite` : "none",
          animationDelay: `${i * 0.045}s`,
          transition: "height 0.25s ease",
        }} />
      ))}
    </div>
  );
}

// ─── AUDIO PLAYER BUBBLE ─────────────────────────────────────────────────────
function AudioBubble({ msgId, text, isUser, apiKey, voiceId, rate, lvColor, speakingId, setSpeakingId, audioCache, setAudioCache }) {
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioRef = useRef(null);
  const playing = speakingId === msgId;
  const stopAll = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  }, [setSpeakingId]);

  const play = async () => {
    // Stop anything playing
    setSpeakingId(null);
    window.speechSynthesis?.cancel();
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }

    if (apiKey) {
      // ElevenLabs path
      setLoadingAudio(true);
      try {
        let url = audioCache[msgId];
        if (!url) {
          url = await elevenLabsTTS(text, apiKey, voiceId);
          setAudioCache(c => ({ ...c, [msgId]: url }));
        }
        const audio = new Audio(url);
        audioRef.current = audio;
        audio.onplay  = () => setSpeakingId(msgId);
        audio.onended = () => setSpeakingId(null);
        audio.onerror = () => { setSpeakingId(null); setLoadingAudio(false); };
        await audio.play();
      } catch (e) {
        console.error("ElevenLabs TTS error:", e);
        setSpeakingId(null);
      }
      setLoadingAudio(false);
    } else {
      // Improved Web Speech fallback
      const stop = webSpeechSpeak(
        text, rate,
        () => setSpeakingId(msgId),
        () => setSpeakingId(null),
        () => setSpeakingId(null),
      );
      audioRef.current = { pause: stop, currentTime: 0 };
    }
  };

  const accentColor = isUser ? "rgba(255,255,255,0.9)" : lvColor || "var(--teal)";
  const bgColor     = isUser ? "rgba(255,255,255,0.15)" : "white";
  const borderColor = isUser ? "rgba(255,255,255,0.25)" : "var(--w100)";

  return (
    <div onClick={playing ? stopAll : play} style={{
      display:"flex", alignItems:"center", gap:9,
      padding:"9px 13px",
      borderRadius: isUser ? "12px 12px 4px 12px" : "4px 12px 12px 12px",
      background: bgColor,
      border: `1px solid ${borderColor}`,
      boxShadow: isUser ? "none" : "0 1px 8px rgba(0,0,0,.05)",
      cursor:"pointer", userSelect:"none", minWidth:160, maxWidth:220,
      transition:"opacity .15s",
    }}>
      {/* Play/Stop button */}
      <div style={{
        width:28, height:28, borderRadius:"50%", flexShrink:0,
        background: isUser ? "rgba(255,255,255,0.25)" : "var(--teal)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        {loadingAudio
          ? <div style={{width:14,height:14,border:`2px solid white`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>
          : playing
            ? <div style={{width:9,height:9,background:"white",borderRadius:2}}/>
            : <svg width="9" height="11" viewBox="0 0 9 11" fill="white"><polygon points="0,0 9,5.5 0,11"/></svg>
        }
      </div>

      {/* Live waveform */}
      <LiveWave playing={playing} color={accentColor} bars={18}/>

      {/* Mode indicator */}
      <div style={{fontSize:9,color:isUser?"rgba(255,255,255,0.6)":"var(--tm)",whiteSpace:"nowrap",flexShrink:0}}>
        {apiKey ? "AI voice" : "TTS"}
      </div>
    </div>
  );
}

// ─── SETTINGS PANEL ───────────────────────────────────────────────────────────
function SettingsPanel({ geminiKey, setGeminiKey, elevenKey, setElevenKey, voiceId, setVoiceId, onClose }) {
  const [draftGemini, setDraftGemini] = useState(geminiKey);
  const [draftEleven, setDraftEleven] = useState(elevenKey);
  const [showG, setShowG] = useState(false);
  const [showE, setShowE] = useState(false);
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(42,37,32,.45)",backdropFilter:"blur(6px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div style={{background:"var(--offwhite)",borderRadius:"20px 20px 0 0",width:"100%",maxWidth:430,padding:"24px 22px 36px",boxShadow:"0 -8px 40px rgba(42,37,32,.14)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div className="ser" style={{fontSize:22}}>Configurações</div>
          <button onClick={onClose} style={{background:"var(--w100)",border:"none",borderRadius:"50%",width:32,height:32,fontSize:16,color:"var(--tm)"}}>✕</button>
        </div>

        {/* Gemini API key — required for chat */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <div style={{fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600}}>Google Gemini API Key</div>
            <div style={{background:"#34A85322",color:"#34A853",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,letterSpacing:"0.08em",textTransform:"uppercase"}}>Obrigatório</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type={showG?"text":"password"} value={draftGemini} onChange={e=>setDraftGemini(e.target.value)}
              placeholder="AIzaSy..."
              style={{flex:1,background:"var(--w100)",border:`1.5px solid ${draftGemini?"var(--teal)":"var(--w200)"}`,borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--tp)",outline:"none"}}/>
            <button onClick={()=>setShowG(s=>!s)} style={{background:"var(--w100)",border:"1px solid var(--w200)",borderRadius:10,padding:"10px 12px",fontSize:12,color:"var(--ts)"}}>{showG?"🙈":"👁️"}</button>
          </div>
          <div style={{fontSize:11,color:"var(--tm)",marginTop:6,lineHeight:1.5}}>
            Gratuito · <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color:"var(--teal)",textDecoration:"none",fontWeight:600}}>aistudio.google.com</a> → "Get API key" → grátis, sem cartão
          </div>
          {draftGemini && <div style={{marginTop:6,fontSize:11,color:"#34A853",fontWeight:600}}>✓ Chave configurada — Aria estará ativa</div>}
          {!draftGemini && <div style={{marginTop:8,background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:10,padding:"8px 12px",fontSize:11,color:"#92400E"}}>⚠️ Sem esta chave a Aria não consegue responder.</div>}
        </div>

        <div style={{height:1,background:"var(--w100)",margin:"4px 0 18px"}}/>

        {/* ElevenLabs key — optional, for human voice */}
        <div style={{marginBottom:18}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
            <div style={{fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600}}>ElevenLabs API Key</div>
            <div style={{background:"var(--w100)",color:"var(--tm)",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:10,letterSpacing:"0.08em",textTransform:"uppercase"}}>Opcional · Voz humana</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input type={showE?"text":"password"} value={draftEleven} onChange={e=>setDraftEleven(e.target.value)}
              placeholder="sk-..."
              style={{flex:1,background:"var(--w100)",border:"1px solid var(--w200)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"var(--tp)",outline:"none"}}/>
            <button onClick={()=>setShowE(s=>!s)} style={{background:"var(--w100)",border:"1px solid var(--w200)",borderRadius:10,padding:"10px 12px",fontSize:12,color:"var(--ts)"}}>{showE?"🙈":"👁️"}</button>
          </div>
          <div style={{fontSize:11,color:"var(--tm)",marginTop:6}}>
            <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" style={{color:"var(--teal)",textDecoration:"none",fontWeight:600}}>elevenlabs.io</a> — 10k chars/mês grátis. Sem chave usa voz do browser.
          </div>
        </div>

        {/* Voice picker */}
        <div style={{marginBottom:22}}>
          <div style={{fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--tm)",marginBottom:10,fontWeight:600}}>Voz da Aria</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {VOICES.map(v=>(
              <div key={v.id} onClick={()=>setVoiceId(v.id)} style={{padding:"12px 14px",borderRadius:12,cursor:"pointer",border:`1.5px solid ${voiceId===v.id?"var(--teal)":"var(--w200)"}`,background:voiceId===v.id?"var(--teal-pale)":"var(--cream)",transition:"all .15s"}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                  <span style={{fontSize:14}}>{v.gender}</span>
                  <span style={{fontSize:13,fontWeight:600,color:voiceId===v.id?"var(--teal)":"var(--tp)"}}>{v.name}</span>
                  {voiceId===v.id&&<span style={{marginLeft:"auto",color:"var(--teal)",fontSize:12}}>✓</span>}
                </div>
                <div style={{fontSize:11,color:"var(--tm)"}}>{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <button onClick={()=>{setGeminiKey(draftGemini);setElevenKey(draftEleven);onClose();}} style={{
          width:"100%",background:"var(--teal)",color:"white",border:"none",borderRadius:12,
          padding:"14px",fontSize:14,fontWeight:700,letterSpacing:"0.04em",
        }}>Salvar configurações</button>
      </div>
    </div>
  );
}

// ─── DOTS & RANK ─────────────────────────────────────────────────────────────
function Dots() {
  return <div style={{display:"flex",gap:4,padding:"11px 15px",alignItems:"center"}}>
    {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--w300)",animation:"dotB 1.2s ease infinite",animationDelay:`${i*0.2}s`}}/>)}
  </div>;
}
function RankBadge({rank}) {
  if(rank===1) return <span style={{width:22,textAlign:"center",fontSize:15,flexShrink:0}}>🥇</span>;
  if(rank===2) return <span style={{width:22,textAlign:"center",fontSize:15,flexShrink:0}}>🥈</span>;
  if(rank===3) return <span style={{width:22,textAlign:"center",fontSize:15,flexShrink:0}}>🥉</span>;
  return <span style={{width:22,textAlign:"center",fontFamily:"'Cormorant Garamond',serif",fontSize:16,color:"var(--tm)",flexShrink:0}}>{rank}</span>;
}

// ─── ARIA COACH TAB ───────────────────────────────────────────────────────────
function AriaCoach({ geminiKey, setGeminiKey, apiKey, setApiKey, voiceId, setVoiceId }) {
  const [lvIdx, setLvIdx]       = useState(2);
  const [msgs, setMsgs]         = useState([{ id:1, who:"bot", text:GREETINGS["B1"], time:tnow(), audio:true }]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [rec, setRec]           = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const [picker, setPicker]     = useState(false);
  const [settings, setSettings] = useState(!geminiKey); // auto-open if no key
  const [history, setHistory]   = useState([]);
  const [audioCache, setAudioCache] = useState({});

  const lv      = LEVELS[lvIdx];
  const chatRef = useRef(null);
  const recRef  = useRef(null);

  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; },[msgs,loading]);

  const changeLevel = i => {
    window.speechSynthesis?.cancel(); setSpeakingId(null);
    setLvIdx(i); setPicker(false); setHistory([]); setAudioCache({});
    // Reset to greeting — history empty so next send will inject new level context
    setMsgs([{id:Date.now(),who:"bot",text:GREETINGS[LEVELS[i].id],time:tnow(),audio:true}]);
  };

  const startRec = () => {
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ alert("Speech recognition not available in this browser."); return; }
    const r = new SR(); r.lang="en-US"; r.interimResults=false;
    r.onresult = e => { setInput(e.results[0][0].transcript); setRec(false); };
    r.onerror = ()=>setRec(false); r.onend = ()=>setRec(false);
    recRef.current=r; r.start(); setRec(true);
  };

  const send = async txt => {
    if(!txt.trim()||loading) return;
    window.speechSynthesis?.cancel(); setSpeakingId(null);
    const userMsg = {id:Date.now(),who:"user",text:txt,time:tnow(),audio:false};
    const nh = [...history,{role:"user",content:txt}];
    setMsgs(p=>[...p,userMsg]); setInput(""); setLoading(true);

    if (!MAKE_WEBHOOK_URL) {
      setMsgs(p=>[...p,{id:Date.now()+1,who:"bot",audio:false,time:tnow(),
        text:"⚙️ Cole a URL do seu webhook Make.com na constante MAKE_WEBHOOK_URL no código para ativar a Aria."}]);
      setLoading(false); return;
    }

    try {
      // Content-Type: text/plain evita o preflight CORS no Make.com
      const res = await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          message: txt,
          level:   lv.id,
          history: nh.map(m => ({ role: m.role, content: m.content })),
          system:  lv.sys,
        }),
      });

      if (!res.ok) throw new Error(`Webhook error ${res.status}`);

      // Lê resposta como texto puro — funciona com JSON ou texto simples
      const raw = await res.text();
      let reply = null;

      // Tenta parsear como JSON primeiro
      try {
        const d = JSON.parse(raw);
        reply = d?.response || d?.text || d?.message || d?.reply || d?.content || d?.output || d?.result || null;
      } catch {
        // Não é JSON — usa o texto puro diretamente
        reply = raw?.trim() || null;
      }

      if (!reply) throw new Error("Webhook respondeu vazio.");

      // Limpa markdown do Gemini (**bold**, *italic*, etc.)
      reply = reply
        .replace(/\*\*(.+?)\*\*/g, "$1")   // **bold** → bold
        .replace(/\*(.+?)\*/g, "$1")         // *italic* → italic
        .replace(/`(.+?)`/g, "$1")           // `code` → code
        .trim();

      const bm = { id: Date.now()+1, who:"bot", text: reply, time: tnow(), audio: true };
      setMsgs(p => [...p, bm]);
      setHistory([...nh, { role:"assistant", content: reply }]);

    } catch(e) {
      setMsgs(p=>[...p,{id:Date.now()+2,who:"bot",audio:false,time:tnow(),
        text:`⚠️ ${e.message}`}]);
    }
    setLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      {settings && (
        <SettingsPanel
          geminiKey={geminiKey} setGeminiKey={setGeminiKey}
          elevenKey={apiKey}    setElevenKey={setApiKey}
          voiceId={voiceId}     setVoiceId={setVoiceId}
          onClose={()=>setSettings(false)}
        />
      )}

      {/* Header */}
      <div style={{padding:"34px 20px 14px",background:"var(--offwhite)",borderBottom:"1px solid var(--w100)",flexShrink:0}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)",marginBottom:3}}>IA Coach · English</div>
            <div className="ser" style={{fontSize:23,fontWeight:400}}>Aria <em style={{color:"var(--teal)"}}>speaks.</em></div>
            <div style={{fontSize:11,color:"var(--ts)",marginTop:2}}>{lv.hint}</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {/* Voice settings button */}
            <button onClick={()=>setSettings(true)} style={{
              background:geminiKey?"var(--teal-pale)":"#FEF3C7",
              border:`1px solid ${geminiKey?"var(--teal-mid)":"#FDE68A"}`,
              borderRadius:20, padding:"6px 12px", fontSize:11, fontWeight:600,
              color:geminiKey?"var(--teal)":"#92400E",
              display:"flex",alignItems:"center",gap:5,
            }}>
              {geminiKey ? "⚙️ Ativo" : "⚙️ Config"}
            </button>
            {/* Level picker */}
            <div style={{position:"relative"}}>
              <button onClick={()=>setPicker(p=>!p)} style={{
                background:lv.color,color:"white",border:"none",borderRadius:20,
                padding:"7px 13px",fontSize:12,fontWeight:700,letterSpacing:"0.04em",
                display:"flex",alignItems:"center",gap:5,
              }}>
                {lv.id} <span style={{opacity:.7,fontSize:10}}>▾</span>
              </button>
              {picker && (
                <div style={{position:"absolute",right:0,top:"calc(100% + 6px)",zIndex:99,
                  background:"white",border:"1px solid var(--w100)",borderRadius:14,
                  boxShadow:"0 8px 32px rgba(42,37,32,.14)",overflow:"hidden",minWidth:192}}>
                  {LEVELS.map((l,i)=>(
                    <div key={l.id} onClick={()=>changeLevel(i)} style={{
                      padding:"11px 16px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,
                      background:i===lvIdx?"var(--teal-pale)":"transparent",
                      borderBottom:i<5?"1px solid var(--w100)":"none",
                    }}>
                      <div style={{width:9,height:9,borderRadius:"50%",background:l.color,flexShrink:0}}/>
                      <span style={{fontSize:13,fontWeight:i===lvIdx?700:400,color:i===lvIdx?"var(--teal)":"inherit"}}>{l.label}</span>
                      {i===lvIdx && <span style={{marginLeft:"auto",color:"var(--teal)",fontSize:13}}>✓</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Level progress bar */}
        <div style={{display:"flex",gap:4,marginTop:12}}>
          {LEVELS.map((l,i)=>(
            <div key={l.id} onClick={()=>changeLevel(i)} style={{
              flex:1,height:4,borderRadius:4,cursor:"pointer",
              background:i<=lvIdx?l.color:"var(--w200)",opacity:i===lvIdx?1:0.55,transition:"all .3s",
            }}/>
          ))}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:9,color:"var(--tm)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Iniciante</span>
          <span style={{fontSize:9,color:"var(--tm)",textTransform:"uppercase",letterSpacing:"0.1em"}}>Fluente</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"14px 16px 6px",
        display:"flex",flexDirection:"column",gap:14,minHeight:0}}>
        {msgs.map(msg=>{
          const bot = msg.who==="bot";
          return (
            <div key={msg.id} style={{animation:"msgIn .3s ease both",
              display:"flex",flexDirection:"column",alignSelf:bot?"flex-start":"flex-end",maxWidth:"88%"}}>
              {bot && (
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
                  <div style={{width:24,height:24,borderRadius:"50%",
                    background:`linear-gradient(135deg,${lv.color},var(--teal-l))`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    color:"white",fontSize:10,fontWeight:700,flexShrink:0}}>A</div>
                  <span style={{fontSize:11,color:"var(--tm)",fontWeight:500}}>Aria</span>
                  {speakingId===msg.id && <span style={{fontSize:10,color:"var(--teal)",fontStyle:"italic"}}>speaking…</span>}
                </div>
              )}

              {/* Text */}
              <div style={{
                padding:"11px 15px",fontSize:14,lineHeight:1.65,
                borderRadius:bot?"4px 14px 14px 14px":"14px 14px 4px 14px",
                background:bot?"white":"var(--teal)",
                color:bot?"var(--tp)":"white",
                border:bot?"1px solid var(--w100)":"none",
                boxShadow:bot?"0 1px 8px rgba(0,0,0,.05)":"0 2px 12px rgba(13,107,107,.25)",
              }}>
                {bot ? <RichText text={msg.text} size={14}/> : msg.text}
              </div>

              {/* Audio player */}
              {msg.audio && (
                <div style={{display:"flex",alignItems:"center",gap:7,marginTop:7,
                  alignSelf:bot?"flex-start":"flex-end"}}>
                  <AudioBubble
                    msgId={msg.id} text={msg.text} isUser={!bot}
                    apiKey={apiKey} voiceId={voiceId} rate={lv.rate}
                    lvColor={lv.color}
                    speakingId={speakingId} setSpeakingId={setSpeakingId}
                    audioCache={audioCache} setAudioCache={setAudioCache}
                  />
                  <span style={{fontSize:10,color:"var(--tm)"}}>{msg.time}</span>
                </div>
              )}
              {!msg.audio && (
                <div style={{fontSize:10,color:"var(--tm)",marginTop:4,padding:"0 4px",textAlign:bot?"left":"right"}}>{msg.time}</div>
              )}
            </div>
          );
        })}
        {loading && (
          <div style={{alignSelf:"flex-start",background:"white",border:"1px solid var(--w100)",
            borderRadius:"4px 14px 14px 14px",boxShadow:"0 1px 8px rgba(0,0,0,.05)"}}>
            <Dots/>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{padding:"10px 14px 22px",background:"var(--offwhite)",borderTop:"1px solid var(--w100)",flexShrink:0}}>
        {rec && (
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,
            padding:"8px 14px",background:"var(--teal-pale)",borderRadius:10}}>
            <div style={{width:9,height:9,borderRadius:"50%",background:"#EF4444",animation:"pulse 1s ease infinite"}}/>
            <span style={{fontSize:12,color:"var(--teal)",fontWeight:600}}>Ouvindo… fale em inglês</span>
            <LiveWave playing={true} bars={10}/>
          </div>
        )}
        <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
          <button onClick={rec?()=>{recRef.current?.stop();setRec(false);}:startRec} style={{
            width:42,height:42,flexShrink:0,border:"none",borderRadius:"50%",
            background:rec?"#EF4444":"var(--w100)",
            display:"flex",alignItems:"center",justifyContent:"center",
            animation:rec?"pulse 1s ease infinite":"none",transition:"background .2s",
          }}>
            {rec
              ? <svg width="12" height="12" viewBox="0 0 12 12" fill="white"><rect width="12" height="12" rx="2"/></svg>
              : <svg width="13" height="17" viewBox="0 0 13 17" fill="none">
                  <rect x="3.5" y="0" width="6" height="9" rx="3" fill="#8A8278"/>
                  <path d="M1 8.5c0 3.038 2.462 5.5 5.5 5.5s5.5-2.462 5.5-5.5" stroke="#8A8278" strokeWidth="1.4" strokeLinecap="round" fill="none"/>
                  <line x1="6.5" y1="14" x2="6.5" y2="17" stroke="#8A8278" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
            }
          </button>
          <textarea rows={1} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input);}}}
            placeholder={rec?"Ou escreva em inglês…":"Write in English…"}
            style={{flex:1,background:"var(--w100)",border:"none",outline:"none",
              borderRadius:21,padding:"11px 16px",fontSize:13.5,color:"var(--tp)",
              lineHeight:1.4,maxHeight:90,overflowY:"auto"}}
          />
          <button onClick={()=>send(input)} disabled={loading||!input.trim()} style={{
            width:42,height:42,flexShrink:0,border:"none",borderRadius:"50%",
            background:(loading||!input.trim())?"var(--w200)":"var(--teal)",
            display:"flex",alignItems:"center",justifyContent:"center",transition:"background .2s",
          }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M1 12L12 6.5L1 1V5.5L8.5 6.5L1 7.5V12Z" fill="white"/>
            </svg>
          </button>
        </div>
        <div style={{display:"flex",gap:6,marginTop:9,flexWrap:"wrap"}}>
          {["Correct my English","Teach me an idiom","Let's roleplay a job interview"].map(s=>(
            <button key={s} onClick={()=>send(s)} style={{
              background:"transparent",border:"1px solid var(--w200)",borderRadius:16,
              padding:"4px 11px",fontSize:11,color:"var(--ts)",fontFamily:"inherit",
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function Leaderboard() {
  return (
    <div style={{flex:1,overflowY:"auto",padding:"32px 16px 16px"}}>

      {/* Prize banner */}
      <div style={{
        borderRadius:16,marginBottom:16,overflow:"hidden",
        background:`linear-gradient(135deg,${PRIZE.color1},${PRIZE.color2})`,
        padding:"18px 20px",boxShadow:"0 4px 24px rgba(201,169,110,.35)",position:"relative",
      }}>
        <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.08)"}}/>
        <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,.7)",marginBottom:4}}>
          {PRIZE.type === "mensal" ? "🏆 Prêmio do Mês" : "🏆 Prêmio da Semana"} · {PRIZE.period}
        </div>
        <div className="ser" style={{fontSize:26,color:"white",fontWeight:400,lineHeight:1.1,marginBottom:4}}>
          {PRIZE.emoji} {PRIZE.title}
        </div>
        <div style={{fontSize:22,fontWeight:700,color:"white",letterSpacing:"-0.01em",marginBottom:8}}>{PRIZE.value}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.75)",marginBottom:4}}>{PRIZE.detail}</div>
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          {[`🥇 ${PRIZE.value} · 1º lugar`,`🥈 ${PRIZE.secondPrize}`,`🥉 ${PRIZE.thirdPrize}`].map((t,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,.18)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"white",fontWeight:600,border:"1px solid rgba(255,255,255,.25)"}}>{t}</div>
          ))}
        </div>
        <div style={{marginTop:10,fontSize:11,color:"rgba(255,255,255,.6)"}}>Reset em {PRIZE.resetIn}</div>
      </div>

      <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:12,padding:"0 6px"}}>Top 10 · Ranking</div>
      <div className="card">
        <div style={{padding:"16px 20px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--w100)"}}>
          <div>
            <div className="ser" style={{fontSize:20}}>Leaderboard</div>
            <div style={{fontSize:11,color:"var(--tm)"}}>Reset em {PRIZE.resetIn}</div>
          </div>
          <div style={{background:`linear-gradient(135deg,${PRIZE.color1},${PRIZE.color2})`,color:"white",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20}}>
            {PRIZE.emoji} {PRIZE.value}
          </div>
        </div>
        {BOARD.map(p=>(
          <div key={p.rank} style={{padding:"10px 20px",display:"flex",alignItems:"center",gap:12,
            borderBottom:p.rank<10?"1px solid var(--w100)":"none",
            background:p.me?"var(--teal-pale)":"transparent"}}>
            <RankBadge rank={p.rank}/>
            <div style={{width:32,height:32,borderRadius:"50%",background:p.bg,flexShrink:0,
              display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700}}>{p.ini}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:p.me?700:500,color:p.me?"var(--teal)":"inherit",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.name}</div>
              <div style={{fontSize:10,color:"var(--tm)"}}>🔥 {p.streak}</div>
            </div>
            <div className="ser" style={{fontSize:17,fontWeight:500,color:p.rank<=3?"var(--teal)":"var(--tp)"}}>
              {p.score.toLocaleString("pt-BR")}
            </div>
          </div>
        ))}
        <div style={{padding:"12px 20px",textAlign:"center",fontSize:12,color:"var(--tm)",borderTop:"1px solid var(--w100)",background:"var(--cream)"}}>
          Você está em <strong style={{color:"var(--teal)"}}>#5</strong> · Faltam <strong style={{color:"var(--teal)"}}>370 XP</strong> para o Top 3
        </div>
      </div>
    </div>
  );
}

// ─── HOME ─────────────────────────────────────────────────────────────────────
function Home({ missions, toggleM, setTab, daysSince, daysToUnlock, bookingUnlocked, onBook }) {
  const [bars, setBars] = useState(false);
  useEffect(()=>{ setTimeout(()=>setBars(true),600); },[]);
  const done = missions.filter(m=>m.done).length;
  const pct  = Math.round((done/missions.length)*100);
  const daysLeft = Math.max(0, daysToUnlock - daysSince);
  const unlockPct = Math.min(100, Math.round((daysSince / daysToUnlock) * 100));

  return (
    <div style={{flex:1}}>
      {/* ── LOGO BAR ── */}
      <div style={{padding:"48px 22px 0",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {/* Logo */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:34,height:34,borderRadius:10,background:"var(--teal)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <circle cx="9" cy="6" r="3.5" stroke="white" strokeWidth="1.5"/>
              <path d="M3 16c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div className="ser" style={{fontSize:20,fontWeight:400,lineHeight:1,letterSpacing:"-0.01em"}}>
              Aria <em style={{color:"var(--teal)"}}>English</em>
            </div>
            <div style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)"}}>AI · Powered</div>
          </div>
        </div>
        {/* Streak badge */}
        <div style={{background:"var(--teal)",color:"white",borderRadius:20,padding:"6px 14px",display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600}}>
          🔥 <span className="ser" style={{fontSize:18,fontWeight:500}}>{daysSince}</span> dias
        </div>
      </div>

      <div style={{padding:"10px 22px 16px"}}>
        <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--tm)",marginBottom:3}}>Saturday Morning</div>
        <div className="ser" style={{fontSize:25,fontWeight:400,lineHeight:1.15}}>Bom dia, <em style={{color:"var(--teal)"}}>Rebecca.</em></div>
        <div style={{marginTop:5,fontSize:13,color:"var(--ts)"}}>You're on a roll. Don't break the streak.</div>
      </div>

      {/* Unlock card — shows progress or CTA depending on days */}
      <div className="f1" style={{padding:"0 16px 8px"}}>
        {bookingUnlocked ? (
          /* ── UNLOCKED ── */
          <div onClick={onBook} style={{
            cursor:"pointer",borderRadius:16,overflow:"hidden",
            background:"linear-gradient(135deg,#0D6B6B 0%,#1A9090 60%,#0A5050 100%)",
            padding:"18px 20px",position:"relative",
            boxShadow:"0 6px 28px rgba(13,107,107,.30)",
          }}>
            <div style={{position:"absolute",top:-18,right:-18,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.07)"}}/>
            <div style={{position:"absolute",bottom:-24,right:32,width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,0.05)"}}/>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,position:"relative"}}>
              <div style={{fontSize:32,lineHeight:1,flexShrink:0}}>🏅</div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"rgba(255,255,255,0.65)",marginBottom:4}}>Recompensa desbloqueada</div>
                <div className="ser" style={{fontSize:20,color:"white",fontWeight:400,lineHeight:1.2,marginBottom:6}}>
                  {daysSince} dias de acesso!<br/><em>Agende sua aula ao vivo.</em>
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.75)",lineHeight:1.5,marginBottom:14}}>
                  Sessão gratuita de 50 min com professor nativo. Escolha o dia, horário e sotaque.
                </div>
                <div style={{display:"inline-flex",alignItems:"center",gap:7,background:"rgba(255,255,255,0.18)",borderRadius:20,padding:"8px 16px",border:"1px solid rgba(255,255,255,0.25)"}}>
                  <span style={{fontSize:12,color:"white",fontWeight:700}}>Agendar agora →</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ── LOCKED — progress towards unlock ── */
          <div style={{
            borderRadius:16,background:"var(--offwhite)",border:"1px solid var(--w100)",
            padding:"16px 18px",boxShadow:"var(--s2)",
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div>
                <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--tm)",marginBottom:3}}>Próxima recompensa</div>
                <div className="ser" style={{fontSize:18,fontWeight:400}}>Aula ao vivo <em style={{color:"var(--teal)"}}>grátis</em></div>
              </div>
              <div style={{background:"var(--w100)",borderRadius:12,padding:"6px 12px",textAlign:"center"}}>
                <div className="ser" style={{fontSize:22,color:"var(--teal)",lineHeight:1}}>{daysLeft}</div>
                <div style={{fontSize:9,color:"var(--tm)",textTransform:"uppercase",letterSpacing:"0.08em"}}>dias</div>
              </div>
            </div>
            {/* Progress bar */}
            <div style={{height:6,background:"var(--w100)",borderRadius:6,overflow:"hidden",marginBottom:8}}>
              <div style={{height:"100%",borderRadius:6,width:`${unlockPct}%`,
                background:"linear-gradient(90deg,var(--teal),var(--teal-l))",transition:"width .5s ease"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:11,color:"var(--tm)"}}>Dia {daysSince} de {daysToUnlock}</span>
              <span style={{fontSize:11,color:"var(--teal)",fontWeight:600}}>{unlockPct}% completo</span>
            </div>
          </div>
        )}
      </div>

      <div style={{height:18}}/>

      <div className="f2" style={{padding:"0 16px 8px"}}>
        <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:12,padding:"0 6px"}}>Performance desta semana</div>
        <div className="card" style={{padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
            <div><div className="ser" style={{fontSize:20}}>Weekly Score</div><div style={{fontSize:12,color:"var(--tm)",marginTop:2}}>Semana 17 · Sáb, 25 Abr</div></div>
            <div style={{textAlign:"right"}}><div className="ser" style={{fontSize:28,color:"var(--teal)",lineHeight:1}}>3,450</div><div style={{fontSize:10,color:"var(--tm)",letterSpacing:"0.1em",textTransform:"uppercase"}}>XP Total</div></div>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:70,marginBottom:8}}>
            {WEEK.map(d=>(
              <div key={d.day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,height:"100%"}}>
                <div style={{flex:1,width:"100%",background:"var(--w100)",borderRadius:4,position:"relative",overflow:"hidden"}}>
                  {!d.future&&<div style={{position:"absolute",bottom:0,left:0,right:0,borderRadius:4,height:bars?`${d.val}%`:"0%",background:d.today?"linear-gradient(180deg,#1A8080,#0D6B6B)":"var(--teal-mid)",transition:"height .8s cubic-bezier(.34,1.56,.64,1)"}}/>}
                </div>
                <div style={{fontSize:9,textTransform:"uppercase",letterSpacing:"0.05em",color:d.today?"var(--teal)":"var(--tm)",fontWeight:d.today?700:500}}>{d.day}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginTop:14}}>
            {[{l:"Speaking",v:"A2",ok:true},{l:"Vocab",v:"B1",ok:true},{l:"Writing",v:"A2",ok:false},{l:"Listen",v:"B2",ok:true}].map(s=>(
              <div key={s.l} style={{flex:1,background:"var(--w100)",borderRadius:10,padding:"7px 4px",textAlign:"center"}}>
                <div style={{fontSize:9,color:"var(--tm)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{s.l}</div>
                <div style={{fontSize:15,fontWeight:600,color:s.ok?"var(--teal)":"var(--gold)",marginTop:1}}>{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{height:18}}/>

      <div className="f3" style={{padding:"0 16px 8px"}}>
        <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:12,padding:"0 6px"}}>Daily Mental Glow Up</div>
        <div className="card">
          <div style={{padding:"16px 20px 12px",borderBottom:"1px solid var(--w100)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div className="ser" style={{fontSize:20}}>Missões do Dia <span style={{fontSize:11,fontFamily:"'DM Sans',sans-serif",color:"var(--tm)",marginLeft:6,verticalAlign:"middle"}}>{done}/{missions.length}</span></div>
            <div style={{background:"var(--teal-pale)",color:"var(--teal)",fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20}}>{pct}% done</div>
          </div>
          <div style={{height:3,background:"var(--w100)",margin:"0 20px 14px",borderRadius:4,overflow:"hidden"}}>
            <div style={{height:"100%",background:"linear-gradient(90deg,var(--teal),var(--teal-l))",borderRadius:4,width:`${pct}%`,transition:"width .4s ease"}}/>
          </div>
          {missions.map(m=>(
            <div key={m.id} onClick={()=>toggleM(m.id)} style={{padding:"13px 20px",display:"flex",alignItems:"center",gap:13,borderBottom:"1px solid var(--w100)",cursor:"pointer",opacity:m.done?.6:1,transition:"opacity .2s"}}>
              <div style={{width:22,height:22,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",border:m.done?"none":"1.5px solid var(--w200)",background:m.done?"var(--teal)":"transparent",transition:"all .25s"}}>
                {m.done&&<span style={{color:"white",fontSize:11}}>✓</span>}
              </div>
              <span style={{fontSize:13.5,flex:1,textDecoration:m.done?"line-through":"none",color:m.done?"var(--tm)":"inherit"}}>{m.text}</span>
              <span style={{fontSize:10,color:"var(--tm)",background:"var(--w100)",padding:"2px 7px",borderRadius:8,fontWeight:500,whiteSpace:"nowrap"}}>{m.tag}</span>
              <span style={{fontSize:11,color:"var(--teal)",fontWeight:600,whiteSpace:"nowrap"}}>{m.xp}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{height:18}}/>

      <div className="f4" style={{padding:"0 16px 8px"}}>
        <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:12,padding:"0 6px"}}>IA Coach · Mentor Pessoal</div>
        <div className="card" style={{padding:20,cursor:"pointer"}} onClick={()=>setTab("coach")}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:"linear-gradient(135deg,#0D6B6B,#1A9090)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:16,fontWeight:700,position:"relative",flexShrink:0}}>
              A
              <div style={{position:"absolute",bottom:2,right:2,width:10,height:10,background:"#4ADE80",borderRadius:"50%",border:"2px solid var(--offwhite)"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:15,fontWeight:600}}>Aria · English Coach</div>
              <div style={{fontSize:12,color:"var(--ts)",marginTop:2}}>Online · Voz humana com ElevenLabs</div>
            </div>
            <div style={{background:"var(--teal)",color:"white",borderRadius:20,padding:"6px 14px",fontSize:12,fontWeight:600}}>Abrir →</div>
          </div>
          <div style={{background:"var(--w100)",borderRadius:12,padding:"12px 14px",fontSize:13,color:"var(--ts)",lineHeight:1.5}}>
            💬 <em>"Hey! I'm Aria, your personal English coach. What would you like to practice today?"</em>
          </div>
          <div style={{display:"flex",gap:6,marginTop:12}}>
            {["🎙️ Falar","⌨️ Escrever","🎧 Ouvir"].map(c=>(
              <div key={c} style={{flex:1,background:"var(--teal-pale)",color:"var(--teal)",borderRadius:10,padding:"7px 4px",textAlign:"center",fontSize:11,fontWeight:600}}>{c}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{height:18}}/>

      <div className="f5" style={{padding:"0 16px 8px"}}>
        <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:12,padding:"0 6px"}}>Top 3 · Esta Semana</div>
        <div className="card">
          {BOARD.slice(0,3).map(p=>(
            <div key={p.rank} style={{padding:"10px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:p.rank<3?"1px solid var(--w100)":"none"}}>
              <RankBadge rank={p.rank}/>
              <div style={{width:30,height:30,borderRadius:"50%",background:p.bg,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:11,fontWeight:700}}>{p.ini}</div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500}}>{p.name}</div><div style={{fontSize:10,color:"var(--tm)"}}>🔥 {p.streak}</div></div>
              <div className="ser" style={{fontSize:17,color:"var(--teal)",fontWeight:500}}>{p.score.toLocaleString("pt-BR")}</div>
            </div>
          ))}
          <div onClick={()=>setTab("rank")} style={{padding:"11px 20px",textAlign:"center",fontSize:12,color:"var(--teal)",fontWeight:600,cursor:"pointer",borderTop:"1px solid var(--w100)",background:"var(--cream)"}}>
            Ver ranking completo · {PRIZE.emoji} {PRIZE.value} em jogo →
          </div>
        </div>
      </div>
      <div style={{height:16}}/>
    </div>
  );
}

// ─── LEARN TAB ────────────────────────────────────────────────────────────────
const TYPE_COLOR = { lesson:"#4E8FAB", grammar:"#7C8A6B", vocabulary:"#B07A5A", speaking:"#0D6B6B", writing:"#8B6B9A", quiz:"#C9A96E", pronunciation:"#B07A5A" };
const TYPE_ICON  = { lesson:"📖", grammar:"✏️", vocabulary:"💬", speaking:"🎙️", writing:"✍️", quiz:"🏁", pronunciation:"🔤" };

function RichText({ text, size = 14 }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {lines.map((line, i) => {
        const isPron = line.trim().startsWith("🔊");
        if (isPron) {
          const content = line.replace(/^🔊\s*Fala:\s*/i, "").replace(/^🔊\s*/i, "");
          return (
            <div key={i} style={{background:"linear-gradient(135deg,var(--teal-pale),#f0f8f8)",border:"1px solid var(--teal-mid)",borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"flex-start",gap:8}}>
              <span style={{fontSize:15,flexShrink:0}}>🔊</span>
              <div>
                <div style={{fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--teal)",fontWeight:700,marginBottom:2}}>Pronúncia</div>
                <div style={{fontFamily:"'DM Sans',monospace",fontSize:13,fontWeight:600,color:"var(--teal)",letterSpacing:"0.04em",lineHeight:1.5}}>{content}</div>
              </div>
            </div>
          );
        }
        if (!line.trim()) return <div key={i} style={{height:4}}/>;
        return <div key={i} style={{fontSize:size, lineHeight:1.65, color:"var(--tp)"}}>{line}</div>;
      })}
    </div>
  );
}

// ─── LESSON PLAYER ────────────────────────────────────────────────────────────
function LessonPlayer({ lesson, moduleColor, moduleLevel, onBack, onComplete }) {
  const [step, setStep]         = useState(0);
  const [quizAns, setQuizAns]   = useState({});
  const [done, setDone]         = useState(false);
  const [practiceMsg, setPracticeMsg]   = useState("");
  const [practiceMsgs, setPracticeMsgs] = useState([]);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [pronounceScore, setPronounceScore] = useState(null);
  const practiceRef = useRef(null);

  const content   = lesson.content;
  const sections  = content?.sections || [];
  const isPractice = step === sections.length + 1;
  const isIntro    = step === 0;
  const curSec     = sections[step - 1];

  useEffect(() => { if (practiceRef.current) practiceRef.current.scrollTop = practiceRef.current.scrollHeight; }, [practiceMsgs]);
  useEffect(() => {
    if (isPractice && practiceMsgs.length === 0) {
      setPracticeMsgs([{ who:"bot", text: content?.practice?.ariaCue || "Let's practice! 🎙️" }]);
    }
  }, [isPractice]);

  const sendPractice = async () => {
    if (!practiceMsg.trim() || practiceLoading) return;
    const userText = practiceMsg;
    setPracticeMsgs(p => [...p, { who:"user", text: userText }]);
    setPracticeMsg(""); setPracticeLoading(true);
    const sys = `You are Aria, an English pronunciation coach. The student finished a lesson about "${lesson.title}" (${moduleLevel}). Evaluate their response. Give phonetic feedback using 🔊 Fala: format. Award a score 0–100 for pronunciation at the end: SCORE:XX. Be encouraging but precise. Max 4 sentences.`;
    try {
      const res = await fetch(MAKE_WEBHOOK_URL, { method:"POST", headers:{"Content-Type":"text/plain"}, body:JSON.stringify({ message:userText, system:sys, level:moduleLevel, history:[] }) });
      const raw = await res.text();
      let reply = null;
      try { const d = JSON.parse(raw); reply = d?.response||d?.text||d?.result||d?.message||null; } catch { reply = raw?.trim()||null; }
      if (reply) {
        const scoreMatch = reply.match(/SCORE:(\d+)/);
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1]); setPronounceScore(score);
          setXpEarned(e => e + Math.round((score/100)*(content?.practice?.xpBonus||20)));
          reply = reply.replace(/SCORE:\d+/g,"").trim();
        }
        reply = reply.replace(/\*\*(.+?)\*\*/g,"$1").replace(/\*(.+?)\*/g,"$1").trim();
        setPracticeMsgs(p => [...p, { who:"bot", text:reply }]);
      }
    } catch { setPracticeMsgs(p => [...p, { who:"bot", text:"⚠️ Erro de conexão." }]); }
    setPracticeLoading(false);
  };

  const handleNext = () => {
    if (isPractice) { setDone(true); onComplete(lesson.id, lesson.xp + xpEarned + (pronounceScore>=90?50:0)); }
    else setStep(s => s+1);
  };

  const quizItems = curSec?.type==="quiz" ? (curSec.items||[]) : [];
  const answerKey = quizItems.find(x=>x.startsWith("answer:"))?.replace("answer:","").trim();
  const choices   = quizItems.filter(x=>!x.startsWith("answer:"));
  const chosen    = quizAns[step];
  const isCorrect = chosen && answerKey && chosen.startsWith(answerKey);
  const totalSteps = sections.length + 2;
  const progress  = Math.round((step/(totalSteps-1))*100);

  if (done) return (
    <div style={{flex:1,overflowY:"auto",padding:"40px 20px 30px",textAlign:"center",animation:"fuUp .4s ease both"}}>
      <div style={{fontSize:56,marginBottom:14}}>{xpEarned>=(content?.practice?.xpBonus||20)*0.8?"🏆":xpEarned>=(content?.practice?.xpBonus||20)*0.5?"🌟":"✅"}</div>
      <div className="ser" style={{fontSize:26,marginBottom:6}}>Aula concluída!</div>
      <div style={{fontSize:13,color:"var(--ts)",lineHeight:1.7,marginBottom:20}}>Você completou <strong>{lesson.title}</strong></div>
      <div style={{background:"var(--teal-pale)",border:"1px solid var(--teal-mid)",borderRadius:14,padding:"16px 18px",marginBottom:20,textAlign:"left"}}>
        <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--teal)",fontWeight:700,marginBottom:12}}>XP Ganhos</div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
          <span style={{fontSize:13,color:"var(--ts)"}}>Aula completa</span>
          <span className="ser" style={{fontSize:17,color:"var(--teal)",fontWeight:500}}>+{lesson.xp} XP</span>
        </div>
        {xpEarned>0 && <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:13,color:"var(--ts)"}}>Prática com Aria {pronounceScore?`(${pronounceScore}%)`:""}</span><span className="ser" style={{fontSize:17,color:"var(--gold)",fontWeight:500}}>+{xpEarned} XP</span></div>}
        {pronounceScore>=90 && <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid var(--teal-mid)"}}><span style={{fontSize:13,color:"var(--teal)",fontWeight:700}}>🔥 Pronúncia perfeita!</span><span className="ser" style={{fontSize:17,color:"var(--teal)",fontWeight:700}}>+50 XP BÔNUS</span></div>}
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px solid var(--teal-mid)",marginTop:4}}><span style={{fontSize:14,fontWeight:700}}>Total</span><span className="ser" style={{fontSize:22,color:"var(--teal)",fontWeight:500}}>+{lesson.xp+xpEarned+(pronounceScore>=90?50:0)} XP</span></div>
      </div>
      <button onClick={onBack} style={{width:"100%",background:"var(--teal)",color:"white",border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:700,fontFamily:"inherit",cursor:"pointer"}}>← Voltar ao módulo</button>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0}}>
      <div style={{background:`linear-gradient(135deg,${moduleColor},${moduleColor}cc)`,padding:"44px 20px 16px",flexShrink:0}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,.2)",border:"none",color:"white",borderRadius:20,padding:"5px 14px",fontSize:12,marginBottom:12,fontFamily:"inherit",cursor:"pointer"}}>← Voltar</button>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
          <span style={{fontSize:18}}>{TYPE_ICON[lesson.type]||"📖"}</span>
          <span style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"2px 10px",fontSize:10,color:"white",fontWeight:700,textTransform:"uppercase"}}>{lesson.type}</span>
          <span style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"2px 10px",fontSize:10,color:"white",fontWeight:600}}>+{lesson.xp} XP base</span>
        </div>
        <div className="ser" style={{fontSize:21,color:"white",fontWeight:400,lineHeight:1.2,marginBottom:3}}>{lesson.title}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,.7)",marginBottom:12}}>⏱ {lesson.duration} · {moduleLevel}</div>
        <div style={{height:3,background:"rgba(255,255,255,.25)",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",background:"white",borderRadius:3,width:`${progress}%`,transition:"width .4s ease"}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
          <span style={{fontSize:9,color:"rgba(255,255,255,.6)",textTransform:"uppercase",letterSpacing:"0.1em"}}>{isIntro?"Introdução":isPractice?"Prática com Aria":`Seção ${step} de ${sections.length}`}</span>
          <span style={{fontSize:9,color:"rgba(255,255,255,.6)"}}>{progress}%</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"16px 16px 100px"}}>
        {/* INTRO + VIDEO */}
        {isIntro && (
          <div style={{animation:"fuUp .35s ease both"}}>
            <div style={{background:"var(--teal-pale)",border:"1px solid var(--teal-mid)",borderRadius:14,padding:"14px 16px",marginBottom:16}}>
              <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--teal)",fontWeight:700,marginBottom:6}}>Por que aprender isso?</div>
              <div style={{fontSize:13,color:"var(--ts)",lineHeight:1.65}}>{content?.intro}</div>
            </div>
            {lesson.video && (
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:8}}>📹 Vídeo de apoio</div>
                <div style={{borderRadius:14,overflow:"hidden",boxShadow:"var(--s2)",position:"relative",paddingBottom:"56.25%",height:0,background:"#000"}}>
                  <iframe src={lesson.video+"?rel=0&modestbranding=1"} style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",border:"none"}} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope" allowFullScreen/>
                </div>
                <div style={{fontSize:11,color:"var(--tm)",marginTop:6,textAlign:"center"}}>Assista para reforçar o conteúdo</div>
              </div>
            )}
            <div style={{background:"var(--offwhite)",border:"1px solid var(--w100)",borderRadius:14,padding:"14px 16px"}}>
              <div style={{fontSize:12,color:"var(--ts)",lineHeight:1.6}}>📌 {sections.length} seções + prática com Aria.{content?.practice?.xpBonus?<span> Pronúncia perfeita = <strong style={{color:"var(--teal)"}}>+{content.practice.xpBonus} XP bônus</strong>!</span>:null}</div>
            </div>
          </div>
        )}

        {/* SECTION CONTENT */}
        {!isIntro && !isPractice && curSec && (
          <div style={{animation:"fuUp .35s ease both"}} key={step}>
            <div style={{fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:10}}>{curSec.type==="quiz"?"🏁 Quiz":curSec.type==="vocabulary"?"💬 Vocabulário":curSec.type==="explanation"?"📖 Explicação":"🎙️ Exemplo"}</div>
            {curSec.type!=="quiz" && (
              <div className="card" style={{padding:"16px 18px",marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:10}}>{curSec.title}</div>
                {curSec.content && <RichText text={curSec.content}/>}
                {curSec.items?.length>0 && (
                  <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
                    {curSec.items.map((item,i)=>(
                      <div key={i} style={{background:"var(--cream)",borderRadius:10,padding:"10px 14px",borderLeft:`3px solid ${moduleColor}`}}>
                        <RichText text={item} size={13}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {curSec.type==="quiz" && (
              <div className="card" style={{padding:"16px 18px",marginBottom:12}}>
                <div style={{fontSize:14,fontWeight:700,marginBottom:14}}>{curSec.title}</div>
                <div style={{fontSize:14,lineHeight:1.65,marginBottom:16}}>{curSec.content}</div>
                {choices.map((opt,i)=>{
                  const letter=opt[0]; const correct=answerKey&&letter===answerKey; const selected=chosen===opt;
                  return (
                    <div key={i} onClick={()=>!chosen&&setQuizAns(q=>({...q,[step]:opt}))} style={{padding:"11px 14px",borderRadius:10,marginBottom:8,cursor:chosen?"default":"pointer",border:`1.5px solid ${!chosen?"var(--w200)":correct?"var(--teal)":selected?"#EF4444":"var(--w200)"}`,background:!chosen?"white":correct?"var(--teal-pale)":selected?"#FEF2F2":"white",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
                      <div style={{width:24,height:24,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,background:!chosen?"var(--w100)":correct?"var(--teal)":selected?"#EF4444":"var(--w100)",color:(!chosen||(!correct&&!selected))?"var(--tm)":"white"}}>{letter}</div>
                      <span style={{fontSize:13,color:!chosen?"var(--tp)":correct?"var(--teal)":selected?"#EF4444":"var(--tm)"}}>{opt.slice(3)}</span>
                      {chosen&&correct&&<span style={{marginLeft:"auto",fontSize:14}}>✓</span>}
                    </div>
                  );
                })}
                {chosen && <div style={{marginTop:10,padding:"10px 14px",borderRadius:10,background:isCorrect?"var(--teal-pale)":"#FEF2F2",border:`1px solid ${isCorrect?"var(--teal-mid)":"#FECACA"}`}}><span style={{fontSize:13,fontWeight:600,color:isCorrect?"var(--teal)":"#EF4444"}}>{isCorrect?"✓ Correto! +10 XP":"✗ Não desta vez."}</span>{!isCorrect&&<span style={{fontSize:12,color:"var(--ts)",marginLeft:6}}>A certa era {answerKey}.</span>}</div>}
              </div>
            )}
          </div>
        )}

        {/* PRACTICE WITH ARIA */}
        {isPractice && (
          <div style={{animation:"fuUp .35s ease both"}}>
            <div style={{background:`linear-gradient(135deg,${moduleColor}22,${moduleColor}11)`,border:`1px solid ${moduleColor}44`,borderRadius:14,padding:"14px 16px",marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:moduleColor,fontWeight:700,marginBottom:4}}>🎙️ Prática com Aria — vale até +{content?.practice?.xpBonus||20} XP</div>
              <div style={{fontSize:12,color:"var(--ts)",lineHeight:1.5}}>Pronúncia perfeita (100%) ganha <strong style={{color:"var(--gold)"}}>+50 XP bônus extra</strong>. Responda em inglês!</div>
            </div>
            {pronounceScore!==null && (
              <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",marginBottom:12,borderRadius:12,background:pronounceScore>=80?"var(--teal-pale)":"#FEF3C7",border:`1px solid ${pronounceScore>=80?"var(--teal-mid)":"#FDE68A"}`}}>
                <div className="ser" style={{fontSize:32,color:pronounceScore>=80?"var(--teal)":"var(--gold)",lineHeight:1}}>{pronounceScore}%</div>
                <div><div style={{fontSize:12,fontWeight:700,color:pronounceScore>=80?"var(--teal)":"#92400E"}}>{pronounceScore>=90?"🏆 Pronúncia perfeita!":pronounceScore>=70?"🌟 Muito bom!":"💪 Continue praticando!"}</div><div style={{fontSize:11,color:"var(--ts)"}}>+{xpEarned} XP ganhos{pronounceScore>=90?" +50 XP bônus!":""}</div></div>
              </div>
            )}
            <div ref={practiceRef} style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12,maxHeight:280,overflowY:"auto"}}>
              {practiceMsgs.map((m,i)=>(
                <div key={i} style={{alignSelf:m.who==="user"?"flex-end":"flex-start",maxWidth:"88%",animation:"msgIn .3s ease both"}}>
                  {m.who==="bot"&&<div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}><div style={{width:22,height:22,borderRadius:"50%",background:`linear-gradient(135deg,${moduleColor},var(--teal-l))`,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:10,fontWeight:700}}>A</div><span style={{fontSize:10,color:"var(--tm)"}}>Aria</span></div>}
                  <div style={{padding:"10px 14px",fontSize:13.5,lineHeight:1.6,borderRadius:m.who==="user"?"14px 14px 4px 14px":"4px 14px 14px 14px",background:m.who==="user"?"var(--teal)":"white",color:m.who==="user"?"white":"var(--tp)",border:m.who==="user"?"none":"1px solid var(--w100)",boxShadow:m.who==="user"?"none":"0 1px 6px rgba(0,0,0,.05)"}}>
                    {m.who==="bot"?<RichText text={m.text} size={13}/>:m.text}
                  </div>
                </div>
              ))}
              {practiceLoading&&<div style={{alignSelf:"flex-start",background:"white",border:"1px solid var(--w100)",borderRadius:"4px 14px 14px 14px",padding:"11px 15px",display:"flex",gap:4}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:"var(--w300)",animation:"dotB 1.2s ease infinite",animationDelay:`${i*0.2}s`}}/>)}</div>}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <textarea rows={2} value={practiceMsg} onChange={e=>setPracticeMsg(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendPractice();}}} placeholder="Responda em inglês…" style={{flex:1,background:"var(--w100)",border:"none",outline:"none",borderRadius:14,padding:"10px 14px",fontSize:13.5,fontFamily:"inherit",color:"var(--tp)",lineHeight:1.4,resize:"none"}}/>
              <button onClick={sendPractice} disabled={practiceLoading||!practiceMsg.trim()} style={{width:42,height:42,flexShrink:0,border:"none",borderRadius:"50%",background:(!practiceLoading&&practiceMsg.trim())?"var(--teal)":"var(--w200)",display:"flex",alignItems:"center",justifyContent:"center",cursor:practiceMsg.trim()?"pointer":"not-allowed"}}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1 12L12 6.5L1 1V5.5L8.5 6.5L1 7.5V12Z" fill="white"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {!done && (
        <div style={{position:"absolute",bottom:72,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,padding:"0 16px 12px",background:"linear-gradient(to top, var(--cream) 70%, transparent)"}}>
          {curSec?.type==="quiz"&&!chosen
            ?<div style={{textAlign:"center",fontSize:12,color:"var(--tm)",padding:"12px"}}>Escolha uma resposta para continuar</div>
            :<button onClick={handleNext} style={{width:"100%",background:"var(--teal)",color:"white",border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:700,fontFamily:"inherit",cursor:"pointer",boxShadow:"0 4px 16px rgba(13,107,107,.35)"}}>
              {isIntro?"Começar aula →":isPractice?`Concluir · +${lesson.xp+xpEarned+(pronounceScore>=90?50:0)} XP →`:step<sections.length?"Próximo →":"Praticar com Aria 🎙️"}
            </button>
          }
        </div>
      )}
    </div>
  );
}

function LearnTab() {
  const [openMod, setOpenMod]     = useState(null);
  const [openLesson, setOpenLesson] = useState(null);
  const [modules, setModules]     = useState(LEARN_MODULES);
  const mod = modules.find(m => m.id === openMod);

  const completeLesson = (lessonId, totalXp) => {
    setModules(mods => mods.map(m => {
      if (m.id !== openMod) return m;
      const updated = m.lessons_list.map(l => l.id === lessonId ? {...l, done:true} : l);
      return {...m, lessons_list:updated, done:updated.filter(l=>l.done).length, lessons:updated.length};
    }));
  };

  if (openMod && openLesson) {
    const lesson = mod?.lessons_list.find(l => l.id === openLesson);
    return (
      <div style={{display:"flex",flexDirection:"column",flex:1,minHeight:0,position:"relative"}}>
        <LessonPlayer lesson={lesson} moduleColor={mod.color} moduleLevel={mod.level} onBack={()=>setOpenLesson(null)} onComplete={completeLesson}/>
      </div>
    );
  }

  if (openMod && mod) return (
    <div style={{flex:1,overflowY:"auto",padding:"0 0 16px"}}>
      <div style={{background:`linear-gradient(135deg,${mod.color},${mod.color}cc)`,padding:"48px 20px 20px",position:"relative"}}>
        <button onClick={()=>setOpenMod(null)} style={{background:"rgba(255,255,255,.2)",border:"none",color:"white",borderRadius:20,padding:"5px 12px",fontSize:12,marginBottom:14,fontFamily:"inherit",cursor:"pointer"}}>← Voltar</button>
        <div style={{fontSize:28,marginBottom:6}}>{mod.icon}</div>
        <div className="ser" style={{fontSize:24,color:"white",fontWeight:400,marginBottom:4}}>{mod.label}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.75)",marginBottom:12}}>{mod.desc}</div>
        <div style={{display:"flex",gap:8}}>
          <div style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"white",fontWeight:600}}>{mod.level}</div>
          <div style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"4px 12px",fontSize:11,color:"white",fontWeight:600}}>{mod.done}/{mod.lessons} aulas</div>
        </div>
        <div style={{height:4,background:"rgba(255,255,255,.25)",borderRadius:4,marginTop:14,overflow:"hidden"}}>
          <div style={{height:"100%",background:"white",borderRadius:4,width:`${Math.round(mod.done/mod.lessons*100)}%`}}/>
        </div>
      </div>
      <div style={{padding:"14px 16px"}}>
        <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:12}}>Aulas do Módulo</div>
        <div className="card">
          {mod.lessons_list.map((l,i)=>{
            const prevDone = i===0 || mod.lessons_list[i-1].done;
            const locked = !prevDone && !l.done;
            return (
              <div key={l.id} onClick={()=>!locked&&setOpenLesson(l.id)} style={{padding:"13px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:i<mod.lessons_list.length-1?"1px solid var(--w100)":"none",cursor:locked?"not-allowed":"pointer",opacity:locked?.5:1}}>
                <div style={{width:34,height:34,borderRadius:10,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:locked?16:14,background:l.done?"var(--teal)":locked?"var(--w100)":`${TYPE_COLOR[l.type]||"#4E8FAB"}22`}}>
                  {locked?"🔒":l.done?<span style={{color:"white",fontSize:13}}>✓</span>:TYPE_ICON[l.type]||"📖"}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:l.done?400:500,color:l.done?"var(--tm)":"var(--tp)",textDecoration:l.done?"line-through":"none"}}>{l.title}</div>
                  <div style={{fontSize:11,color:"var(--tm)",marginTop:2,display:"flex",gap:8}}>
                    <span style={{background:`${TYPE_COLOR[l.type]||"#4E8FAB"}22`,color:TYPE_COLOR[l.type]||"#4E8FAB",borderRadius:6,padding:"1px 7px",fontSize:10,fontWeight:600,textTransform:"capitalize"}}>{l.type}</span>
                    <span>⏱ {l.duration}</span>
                    <span style={{color:"var(--teal)",fontWeight:600}}>+{l.xp} XP</span>
                  </div>
                </div>
                {!locked&&!l.done&&<div style={{width:28,height:28,borderRadius:"50%",background:"var(--teal)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><svg width="9" height="10" viewBox="0 0 9 10" fill="white"><polygon points="0,0 9,5 0,10"/></svg></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const totalDone    = modules.reduce((a,m)=>a+m.done,0);
  const totalLessons = modules.reduce((a,m)=>a+m.lessons,0);
  return (
    <div style={{flex:1,overflowY:"auto",padding:"36px 16px 16px"}}>
      <div style={{padding:"0 6px 16px",display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)",marginBottom:4}}>Trilha de Aprendizado</div>
          <div className="ser" style={{fontSize:24,fontWeight:400}}>Learn <em style={{color:"var(--teal)"}}>English.</em></div>
        </div>
        <div style={{background:"var(--teal-pale)",border:"1px solid var(--teal-mid)",borderRadius:20,padding:"5px 12px",fontSize:11,color:"var(--teal)",fontWeight:600}}>Do zero ↗</div>
      </div>
      <div className="card" style={{padding:"16px 18px",marginBottom:16}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:13,fontWeight:600}}>Progresso geral</div>
          <div className="ser" style={{fontSize:20,color:"var(--teal)"}}>{totalDone} / {totalLessons} aulas</div>
        </div>
        <div style={{height:6,background:"var(--w100)",borderRadius:6,overflow:"hidden"}}>
          <div style={{height:"100%",background:"linear-gradient(90deg,var(--teal),var(--teal-l))",borderRadius:6,width:`${Math.round(totalDone/totalLessons*100)}%`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <span style={{fontSize:11,color:"var(--tm)"}}>{Math.round(totalDone/totalLessons*100)}% completo</span>
          <span style={{fontSize:11,color:"var(--teal)",fontWeight:600}}>Pronúncia perfeita = +50 XP 🏆</span>
        </div>
      </div>
      <div style={{fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:12,padding:"0 6px"}}>Módulos</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {modules.map((m,i)=>{
          const pct=Math.round(m.done/m.lessons*100);
          const locked=i>0&&modules[i-1].done<modules[i-1].lessons;
          return (
            <div key={m.id} onClick={()=>!locked&&setOpenMod(m.id)} className="card" style={{padding:"16px 18px",cursor:locked?"not-allowed":"pointer",opacity:locked?.65:1}}>
              <div style={{display:"flex",alignItems:"flex-start",gap:14}}>
                <div style={{width:48,height:48,borderRadius:14,background:locked?"var(--w100)":`${m.color}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{locked?"🔒":m.icon}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                    <div style={{fontSize:15,fontWeight:600,color:locked?"var(--tm)":"var(--tp)"}}>{m.label}</div>
                    <div style={{fontSize:10,background:locked?"var(--w100)":`${m.color}22`,color:locked?"var(--tm)":m.color,padding:"2px 8px",borderRadius:10,fontWeight:600,whiteSpace:"nowrap",marginLeft:8}}>{m.level}</div>
                  </div>
                  <div style={{fontSize:12,color:"var(--ts)",marginBottom:8,lineHeight:1.4}}>{m.desc}</div>
                  <div style={{height:4,background:"var(--w100)",borderRadius:4,overflow:"hidden",marginBottom:5}}>
                    <div style={{height:"100%",borderRadius:4,background:locked?"var(--w200)":m.color,width:`${pct}%`,transition:"width .5s ease"}}/>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:11,color:"var(--tm)"}}>{m.done}/{m.lessons} aulas</span>
                    {!locked&&pct>0&&<span style={{fontSize:11,color:m.color,fontWeight:600}}>{pct}%</span>}
                    {locked&&<span style={{fontSize:11,color:"var(--tm)"}}>Complete o módulo anterior</span>}
                    {!locked&&pct===0&&<span style={{fontSize:11,color:m.color,fontWeight:600}}>Começar →</span>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── VOCÊ TAB ─────────────────────────────────────────────────────────────────
const BADGES = [
  { icon:"🎯", label:"First Lesson",    earned:true  },
  { icon:"🔥", label:"7-Day Streak",    earned:true  },
  { icon:"🗣️", label:"First Speaking",  earned:true  },
  { icon:"✍️", label:"Essay Writer",    earned:false },
  { icon:"🏅", label:"Live Class",      earned:false },
  { icon:"🏆", label:"Top 3 Rank",      earned:false },
];

function VoceTab({ daysSince, setTab }) {
  const SKILLS = [
    { label:"Speaking",  val:62, color:"#0D6B6B" },
    { label:"Listening", val:74, color:"#4E8FAB" },
    { label:"Grammar",   val:58, color:"#7C8A6B" },
    { label:"Vocabulary",val:70, color:"#B07A5A" },
    { label:"Writing",   val:45, color:"#8B6B9A" },
  ];

  return (
    <div style={{flex:1,overflowY:"auto",padding:"0 0 16px"}}>
      {/* Profile hero */}
      <div style={{background:"linear-gradient(160deg,#0D6B6B,#1A9090)",padding:"50px 20px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,.06)"}}/>
        <div style={{position:"absolute",bottom:-40,left:-20,width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,.05)"}}/>
        <div style={{position:"relative",display:"flex",alignItems:"center",gap:16}}>
          <div style={{width:68,height:68,borderRadius:"50%",background:"rgba(255,255,255,.2)",border:"2.5px solid rgba(255,255,255,.5)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span className="ser" style={{fontSize:28,color:"white",fontWeight:400}}>R</span>
          </div>
          <div>
            <div className="ser" style={{fontSize:24,color:"white",fontWeight:400,lineHeight:1}}>Rebecca</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.75)",marginTop:3}}>B1 · Intermediate</div>
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <div style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"3px 10px",fontSize:10,color:"white",fontWeight:600}}>🔥 {daysSince} dias</div>
              <div style={{background:"rgba(255,255,255,.2)",borderRadius:20,padding:"3px 10px",fontSize:10,color:"white",fontWeight:600}}>⭐ 3,450 XP</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:"16px 16px 0"}}>

        {/* Stats row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:16}}>
          {[
            {label:"XP Total", val:"3.4k"},
            {label:"Aulas",    val:"19"},
            {label:"Streak",   val:`${daysSince}d`},
            {label:"Ranking",  val:"#5"},
          ].map(s=>(
            <div key={s.label} style={{background:"var(--offwhite)",border:"1px solid var(--w100)",borderRadius:12,padding:"10px 6px",textAlign:"center",boxShadow:"var(--s2)"}}>
              <div className="ser" style={{fontSize:20,color:"var(--teal)",lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:9,color:"var(--tm)",textTransform:"uppercase",letterSpacing:"0.08em",marginTop:3}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Skills breakdown */}
        <div className="card" style={{padding:"16px 18px",marginBottom:14}}>
          <div className="ser" style={{fontSize:18,marginBottom:14}}>Skill Breakdown</div>
          {SKILLS.map(s=>(
            <div key={s.label} style={{marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,fontWeight:500}}>{s.label}</span>
                <span style={{fontSize:12,color:s.color,fontWeight:600}}>{s.val}%</span>
              </div>
              <div style={{height:6,background:"var(--w100)",borderRadius:6,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:6,background:s.color,width:`${s.val}%`,transition:"width .7s ease"}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div className="card" style={{padding:"16px 18px",marginBottom:14}}>
          <div className="ser" style={{fontSize:18,marginBottom:14}}>Conquistas</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {BADGES.map(b=>(
              <div key={b.label} style={{
                padding:"12px 8px",borderRadius:12,textAlign:"center",
                background:b.earned?"var(--teal-pale)":"var(--w100)",
                border:`1.5px solid ${b.earned?"var(--teal-mid)":"var(--w200)"}`,
                opacity:b.earned?1:.55,
              }}>
                <div style={{fontSize:22,marginBottom:4}}>{b.icon}</div>
                <div style={{fontSize:10,fontWeight:600,color:b.earned?"var(--teal)":"var(--tm)",lineHeight:1.2}}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current plan */}
        <div className="card" style={{padding:"16px 18px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div className="ser" style={{fontSize:18}}>Plano atual</div>
            <div style={{background:"linear-gradient(135deg,#C9A96E,#A07840)",color:"white",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20}}>PRO</div>
          </div>
          {[
            ["✅","Acesso ilimitado à Aria"],
            ["✅","Missões diárias"],
            ["✅","Ranking competitivo"],
            ["✅","1 aula ao vivo / 7 dias"],
            ["⬜","Feedback de pronúncia (em breve)"],
          ].map(([ico,txt])=>(
            <div key={txt} style={{display:"flex",gap:8,marginBottom:8,fontSize:13,color:"var(--ts)"}}>
              <span>{ico}</span><span>{txt}</span>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="card" style={{marginBottom:14}}>
          {[
            {ico:"🌐",label:"Idioma da interface",val:"Português"},
            {ico:"🔔",label:"Notificações",val:"Ativadas"},
            {ico:"🎯",label:"Meta diária",val:"30 min"},
            {ico:"🔒",label:"Conta & segurança",val:""},
          ].map((s,i,arr)=>(
            <div key={s.label} style={{padding:"14px 18px",display:"flex",alignItems:"center",gap:12,borderBottom:i<arr.length-1?"1px solid var(--w100)":"none",cursor:"pointer"}}>
              <span style={{fontSize:16,flexShrink:0}}>{s.ico}</span>
              <span style={{flex:1,fontSize:13}}>{s.label}</span>
              <span style={{fontSize:12,color:"var(--tm)"}}>{s.val}</span>
              <span style={{fontSize:12,color:"var(--tm)"}}>›</span>
            </div>
          ))}
        </div>

        {/* Sign out */}
        <button style={{width:"100%",background:"transparent",border:"1px solid var(--w200)",borderRadius:12,padding:"13px",fontSize:13,color:"var(--w400)",fontFamily:"inherit",marginBottom:8}}>
          Sair da conta
        </button>
        <div style={{textAlign:"center",fontSize:11,color:"var(--tm)",marginBottom:8}}>Aria English · v1.0 · Todos os direitos reservados</div>
      </div>
    </div>
  );
}

// ─── BOOKING MODAL ───────────────────────────────────────────────────────────
//
// 🔧 CONFIGURAÇÃO — cole a URL do seu Apps Script publicado abaixo:
// (veja o arquivo SETUP_AULAS.md para instruções passo a passo)
//
const SHEETS_URL = ""; // ex: "https://script.google.com/macros/s/SEU_ID/exec"

// Dados de fallback caso a planilha não esteja configurada ainda
const FALLBACK_TEACHERS = [
  { id:"sarah",  name:"Sarah K.",   flag:"🇺🇸", accent:"American",   xp:"1.2k sessions", avatar:"SK", color:"#4E8FAB" },
  { id:"james",  name:"James O.",   flag:"🇬🇧", accent:"British",    xp:"980 sessions",  avatar:"JO", color:"#0D6B6B" },
  { id:"claire", name:"Claire M.",  flag:"🇦🇺", accent:"Australian", xp:"756 sessions",  avatar:"CM", color:"#7C8A6B" },
];
const FALLBACK_SLOTS = [
  { time:"07:00", label:"07h00", period:"Manhã",  vagas:3 },
  { time:"08:00", label:"08h00", period:"Manhã",  vagas:2 },
  { time:"12:00", label:"12h00", period:"Tarde",  vagas:4 },
  { time:"13:00", label:"13h00", period:"Tarde",  vagas:2 },
  { time:"18:00", label:"18h00", period:"Noite",  vagas:5 },
  { time:"19:00", label:"19h00", period:"Noite",  vagas:3 },
  { time:"20:00", label:"20h00", period:"Noite",  vagas:2 },
];

function getDays() {
  const days = []; const now = new Date();
  const wk = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const mo = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  for (let i = 1; i <= 7; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    days.push({ date: d, label: `${wk[d.getDay()]}`, num: d.getDate(), month: mo[d.getMonth()] });
  }
  return days;
}

function BookingModal({ onClose }) {
  const [step, setStep]         = useState(0);
  const [teacher, setTeacher]   = useState(null);
  const [day, setDay]           = useState(null);
  const [slot, setSlot]         = useState(null);
  const [teachers, setTeachers] = useState(FALLBACK_TEACHERS);
  const [slots, setSlots]       = useState(FALLBACK_SLOTS);
  const [fetching, setFetching] = useState(false);
  const days = getDays();
  const confirmed = step === 4;

  // Fetch live data from Google Sheets on open
  useEffect(() => {
    if (!SHEETS_URL) return;
    setFetching(true);
    fetch(`${SHEETS_URL}?action=getConfig`)
      .then(r => r.json())
      .then(d => {
        if (d.teachers?.length) setTeachers(d.teachers);
        if (d.slots?.length)    setSlots(d.slots);
      })
      .catch(() => {}) // silently use fallback
      .finally(() => setFetching(false));
  }, []);

  const periods = [...new Set(slots.map(s => s.period))];
  const stepLabels = ["Professor","Data","Horário","Confirmar"];

  return (
    <div style={{position:"fixed",inset:0,zIndex:300,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      {/* Backdrop */}
      <div onClick={confirmed ? onClose : undefined} style={{position:"absolute",inset:0,background:"rgba(42,37,32,.5)",backdropFilter:"blur(6px)"}}/>

      {/* Sheet */}
      <div style={{
        position:"relative",background:"var(--offwhite)",width:"100%",maxWidth:430,
        borderRadius:"24px 24px 0 0",boxShadow:"0 -8px 48px rgba(42,37,32,.18)",
        animation:"sheetUp .38s cubic-bezier(.34,1.1,.64,1) both",
        maxHeight:"90vh",display:"flex",flexDirection:"column",overflow:"hidden",
      }}>
        {/* Handle */}
        <div style={{display:"flex",justifyContent:"center",padding:"12px 0 4px"}}>
          <div style={{width:36,height:4,background:"var(--w200)",borderRadius:4}}/>
        </div>

        {/* Header */}
        <div style={{padding:"8px 22px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid var(--w100)"}}>
          <div>
            <div style={{fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:"var(--tm)"}}>Aula ao Vivo</div>
            <div className="ser" style={{fontSize:22,fontWeight:400}}>
              {confirmed ? <span style={{color:"var(--teal)"}}>Aula confirmada ✓</span> : "Agendar sessão"}
            </div>
          </div>
          <button onClick={onClose} style={{background:"var(--w100)",border:"none",borderRadius:"50%",width:32,height:32,fontSize:15,color:"var(--tm)"}}>✕</button>
        </div>

        {/* Step indicator */}
        {!confirmed && (
          <div style={{padding:"12px 22px 0",display:"flex",gap:6,alignItems:"center"}}>
            {stepLabels.map((l,i)=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                    background:i<step?"var(--teal)":i===step?"var(--teal)":"var(--w100)",
                    fontSize:10,fontWeight:700,color:i<=step?"white":"var(--tm)",transition:"all .25s",
                    flexShrink:0}}>
                    {i<step ? "✓" : i+1}
                  </div>
                  <span style={{fontSize:10,fontWeight:i===step?700:400,color:i===step?"var(--teal)":"var(--tm)",whiteSpace:"nowrap"}}>{l}</span>
                </div>
                {i<3 && <div style={{width:16,height:1.5,background:i<step?"var(--teal)":"var(--w200)",borderRadius:2,transition:"background .3s"}}/>}
              </div>
            ))}
          </div>
        )}

        {/* Loading from Sheets */}
        {fetching && (
          <div style={{padding:"8px 22px",display:"flex",alignItems:"center",gap:8,background:"var(--teal-pale)",borderBottom:"1px solid var(--teal-mid)"}}>
            <div style={{width:12,height:12,border:"2px solid var(--teal)",borderTopColor:"transparent",borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>
            <span style={{fontSize:11,color:"var(--teal)"}}>Buscando horários atualizados…</span>
          </div>
        )}

        {/* Content */}
        <div style={{flex:1,overflowY:"auto",padding:"16px 22px 22px"}}>

          {/* DONE */}
          {confirmed && (
            <div style={{textAlign:"center",padding:"20px 0 10px",animation:"fuUp .4s ease both"}}>
              <div style={{fontSize:56,marginBottom:12,animation:"confetti 1.5s ease 3"}}>🎉</div>
              <div className="ser" style={{fontSize:26,marginBottom:6}}>Aula agendada!</div>
              <div style={{fontSize:13,color:"var(--ts)",lineHeight:1.6,marginBottom:22}}>
                Sua aula ao vivo com <strong>{teacher?.name}</strong> está confirmada para<br/>
                <strong>{day?.label}, {day?.num} de {day?.month}</strong> às <strong>{slot?.label}</strong>.
              </div>
              <div style={{background:"var(--teal-pale)",border:"1px solid var(--teal-mid)",borderRadius:14,padding:"16px 18px",textAlign:"left",marginBottom:18}}>
                <div style={{fontSize:11,color:"var(--tm)",marginBottom:8,letterSpacing:"0.1em",textTransform:"uppercase"}}>Detalhes da sessão</div>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:teacher?.color,display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:12,fontWeight:700}}>{teacher?.avatar}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:600}}>{teacher?.name}</div>
                    <div style={{fontSize:11,color:"var(--ts)"}}>{teacher?.flag} {teacher?.accent} English</div>
                  </div>
                </div>
                {[
                  ["📅","Data",`${day?.label}, ${day?.num} de ${day?.month}`],
                  ["🕐","Horário",`${slot?.label} (50 minutos)`],
                  ["🎯","Nível","B1 · Intermediate"],
                  ["📍","Formato","Google Meet — link no email"],
                ].map(([ico,label,val])=>(
                  <div key={label} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:7}}>
                    <span style={{fontSize:13,flexShrink:0}}>{ico}</span>
                    <span style={{fontSize:12,color:"var(--tm)",minWidth:60}}>{label}</span>
                    <span style={{fontSize:12,fontWeight:500}}>{val}</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose} style={{width:"100%",background:"var(--teal)",color:"white",border:"none",borderRadius:12,padding:"14px",fontSize:14,fontWeight:700}}>
                Perfeito, obrigado! →
              </button>
            </div>
          )}

          {/* STEP 0 — choose teacher */}
          {step===0 && (
            <div style={{animation:"fuUp .3s ease both"}}>
              <div style={{fontSize:13,color:"var(--ts)",marginBottom:14}}>Escolha seu professor para esta sessão:</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {teachers.map(t=>(
                  <div key={t.id} onClick={()=>{setTeacher(t);setStep(1);}} style={{
                    padding:"14px 16px",borderRadius:14,cursor:"pointer",
                    border:`1.5px solid ${teacher?.id===t.id?"var(--teal)":"var(--w200)"}`,
                    background:teacher?.id===t.id?"var(--teal-pale)":"white",
                    display:"flex",alignItems:"center",gap:12,transition:"all .18s",
                  }}>
                    <div style={{width:44,height:44,borderRadius:"50%",background:t.color||"var(--teal)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:14,fontWeight:700,flexShrink:0}}>{t.avatar}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:600}}>{t.name} <span style={{fontSize:13}}>{t.flag}</span></div>
                      <div style={{fontSize:12,color:"var(--ts)",marginTop:2}}>{t.accent} English · {t.xp}</div>
                    </div>
                    <div style={{width:20,height:20,borderRadius:"50%",border:`1.5px solid ${teacher?.id===t.id?"var(--teal)":"var(--w200)"}`,background:teacher?.id===t.id?"var(--teal)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {teacher?.id===t.id && <span style={{color:"white",fontSize:10}}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — choose date */}
          {step===1 && (
            <div style={{animation:"fuUp .3s ease both"}}>
              <div style={{fontSize:13,color:"var(--ts)",marginBottom:14}}>Selecione o melhor dia para você:</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:18}}>
                {days.map((d,i)=>(
                  <div key={i} onClick={()=>{setDay(d);setStep(2);}} style={{
                    padding:"12px 6px",borderRadius:14,textAlign:"center",cursor:"pointer",
                    border:`1.5px solid ${day?.num===d.num?"var(--teal)":"var(--w200)"}`,
                    background:day?.num===d.num?"var(--teal)":"white",
                    transition:"all .18s",
                  }}>
                    <div style={{fontSize:10,color:day?.num===d.num?"rgba(255,255,255,0.7)":"var(--tm)",textTransform:"uppercase",letterSpacing:"0.06em"}}>{d.label}</div>
                    <div className="ser" style={{fontSize:22,fontWeight:400,color:day?.num===d.num?"white":"var(--tp)",lineHeight:1.2,marginTop:2}}>{d.num}</div>
                    <div style={{fontSize:10,color:day?.num===d.num?"rgba(255,255,255,0.7)":"var(--tm)",marginTop:1}}>{d.month}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>setStep(0)} style={{background:"transparent",border:"none",fontSize:12,color:"var(--tm)",fontFamily:"inherit",padding:0}}>← Voltar</button>
            </div>
          )}

          {/* STEP 2 — choose time */}
          {step===2 && (
            <div style={{animation:"fuUp .3s ease both"}}>
              <div style={{fontSize:13,color:"var(--ts)",marginBottom:14}}>
                Horários disponíveis — <strong>{day?.label}, {day?.num}/{day?.month}</strong>:
              </div>
              {periods.map(p=>(
                <div key={p} style={{marginBottom:14}}>
                  <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--tm)",fontWeight:600,marginBottom:8}}>{p}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {slots.filter(s=>s.period===p).map(s=>(
                      <div key={s.time} onClick={()=>{setSlot(s);setStep(3);}} style={{
                        padding:"10px 14px",borderRadius:10,cursor:"pointer",
                        border:`1.5px solid ${slot?.time===s.time?"var(--teal)":"var(--w200)"}`,
                        background:slot?.time===s.time?"var(--teal)":"white",
                        color:slot?.time===s.time?"white":"var(--tp)",
                        transition:"all .18s",
                      }}>
                        <div style={{fontSize:13,fontWeight:700}}>{s.label}</div>
                        {s.vagas != null && (
                          <div style={{fontSize:10,marginTop:2,opacity:.75}}>
                            {s.vagas} {s.vagas===1?"vaga":"vagas"}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={()=>setStep(1)} style={{background:"transparent",border:"none",fontSize:12,color:"var(--tm)",fontFamily:"inherit",padding:0,marginTop:4}}>← Voltar</button>
            </div>
          )}

          {/* STEP 3 — confirm */}
          {step===3 && (
            <div style={{animation:"fuUp .3s ease both"}}>
              <div style={{fontSize:13,color:"var(--ts)",marginBottom:14}}>Confirme os detalhes da sua aula:</div>
              <div style={{background:"var(--teal-pale)",border:"1px solid var(--teal-mid)",borderRadius:14,padding:"16px 18px",marginBottom:18}}>
                {[
                  ["👤","Professor",`${teacher?.name} (${teacher?.flag} ${teacher?.accent})`],
                  ["📅","Data",`${day?.label}, ${day?.num} de ${day?.month}`],
                  ["🕐","Horário",`${slot?.label} · 50 minutos`],
                  ["📍","Formato","Google Meet · link no email"],
                ].map(([ico,label,val])=>(
                  <div key={label} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10,paddingBottom:10,borderBottom:"1px solid var(--teal-mid)"}}>
                    <span style={{fontSize:14,flexShrink:0}}>{ico}</span>
                    <span style={{fontSize:12,color:"var(--ts)",minWidth:72}}>{label}</span>
                    <span style={{fontSize:13,fontWeight:600,color:"var(--tp)"}}>{val}</span>
                  </div>
                ))}
                <div style={{fontSize:11,color:"var(--ts)",marginTop:4}}>Você receberá um email de confirmação com o link do Google Meet.</div>
              </div>
              <button onClick={()=>setStep(4)} style={{
                width:"100%",background:"var(--teal)",color:"white",border:"none",borderRadius:12,
                padding:"14px",fontSize:14,fontWeight:700,marginBottom:10,letterSpacing:"0.02em",
                animation:"glowPulse 2s ease infinite",
              }}>Confirmar aula →</button>
              <button onClick={()=>setStep(2)} style={{width:"100%",background:"transparent",border:"1px solid var(--w200)",borderRadius:12,padding:"12px",fontSize:13,color:"var(--ts)",fontFamily:"inherit"}}>← Ajustar horário</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState("home");
  const [missions, setMissions]   = useState(MISSIONS);
  const [apiKey, setApiKey]       = useState("");       // ElevenLabs
  const [geminiKey, setGeminiKey] = useState("");       // Google Gemini — required for AI chat
  const [voiceId, setVoiceId]     = useState("21m00Tcm4TlvDq8ikWAM");
  const [showBooking, setShowBooking] = useState(false);
  const toggleM = id => setMissions(m => m.map(t => t.id===id ? {...t,done:!t.done} : t));

  // Expose geminiKey globally so LessonPlayer (deep in LearnTab) can access it
  useEffect(() => { window._ariaGeminiKey = geminiKey; }, [geminiKey]);

  // ── Days-since-first-login logic ──────────────────────────────────────────
  // On first render, stamp the date in localStorage if not already there.
  // In production, replace localStorage with your auth provider's createdAt field.
  const [daysSince, setDaysSince] = useState(0);
  useEffect(() => {
    const KEY = "aria_first_login";
    let stored = localStorage.getItem(KEY);
    if (!stored) {
      stored = new Date().toISOString();
      localStorage.setItem(KEY, stored);
    }
    const diff = Math.floor((Date.now() - new Date(stored).getTime()) / 86_400_000);
    setDaysSince(diff);
  }, []);

  const DAYS_TO_UNLOCK = 7;          // ← change here to adjust the gate
  const bookingUnlocked = daysSince >= DAYS_TO_UNLOCK;

  const TABS = [
    { id:"home",  icon:"⌂", label:"Home"  },
    { id:"learn", icon:"◈", label:"Learn" },
    { id:"coach", icon:"◇", label:"Coach" },
    { id:"rank",  icon:"△", label:"Rank"  },
    { id:"you",   icon:"○", label:"Você"  },
  ];

  return (
    <div className="wrap">
      <style>{G}</style>

      {showBooking && <BookingModal onClose={()=>setShowBooking(false)}/>}

      {/* Pages — each gets page-scroll class for proper padding */}
      <div className="page-scroll" style={{minHeight:"100vh"}}>
        {tab==="home"  && <Home missions={missions} toggleM={toggleM} setTab={setTab} daysSince={daysSince} daysToUnlock={DAYS_TO_UNLOCK} bookingUnlocked={bookingUnlocked} onBook={()=>setShowBooking(true)}/>}
        {tab==="learn" && <LearnTab/>}
        {tab==="rank"  && <Leaderboard/>}
        {tab==="you"   && <VoceTab daysSince={daysSince} setTab={setTab}/>}
      </div>
      {/* Coach gets its own fixed-height container so its internal scroll works */}
      {tab==="coach" && (
        <div style={{position:"fixed",top:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,height:"calc(100dvh - 72px)",display:"flex",flexDirection:"column",background:"var(--cream)",zIndex:10}}>
          <AriaCoach geminiKey={geminiKey} setGeminiKey={setGeminiKey} apiKey={apiKey} setApiKey={setApiKey} voiceId={voiceId} setVoiceId={setVoiceId}/>
        </div>
      )}

      {/* FIXED bottom nav */}
      <div className="nav-fixed" style={{background:"rgba(250,250,247,0.96)",backdropFilter:"blur(16px)",borderTop:"1px solid var(--w100)",display:"flex",justifyContent:"space-around",padding:"10px 0 18px"}}>
        {TABS.map(t=>(
          <div key={t.id} onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"2px 10px",position:"relative"}}>
            <span style={{fontSize:18,opacity:t.id===tab?1:0.45,transition:"opacity .2s"}}>{t.icon}</span>
            <span style={{fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:t.id===tab?"var(--teal)":"var(--tm)",fontWeight:t.id===tab?700:500,transition:"color .2s"}}>{t.label}</span>
            {t.id===tab && <div style={{width:4,height:4,background:"var(--teal)",borderRadius:"50%"}}/>}
            {/* Booking notification dot on Home */}
            {t.id==="home" && bookingUnlocked && tab!=="home" && (
              <div style={{position:"absolute",top:0,right:10,width:7,height:7,background:"var(--gold)",borderRadius:"50%",border:"1.5px solid var(--offwhite)"}}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
