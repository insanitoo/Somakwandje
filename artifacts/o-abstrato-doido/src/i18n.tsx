import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Language = "pt" | "en" | "fr";

export const languageOptions: Array<{ code: Language; label: string }> = [
  { code: "pt", label: "Português" },
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
];

const messages = {
  pt: {
    nav: {
      home: "Home",
      gallery: "Galeria",
      agenda: "Agenda",
      about: "Sobre",
      courses: "Cursos",
      language: "Idioma",
      menu: "Menu",
      whatsapp: "WhatsApp",
    },
    common: {
      close: "Fechar",
      previous: "Anterior",
      next: "Próxima",
      view: "Ver",
      description: "Descrição",
      available: "Disponível",
      availablePlural: "Disponíveis",
      sold: "Vendido",
      soldFemale: "Vendida",
      soldPlural: "Vendidas",
      large: "Grande",
      small: "Pequena",
      largePlural: "Grandes",
      smallPlural: "Pequenas",
      priceOnRequest: "Preço sob consulta",
      interested: "Interessado",
      realized: "Realizado",
    },
    home: {
      viewWorks: "Ver Obras",
      galleryHighlights: "Destaques da Galeria",
      viewAll: "Ver todas",
      viewAllWorks: "Ver todas as obras",
      worksSoon: "As obras serão adicionadas em breve",
      aboutArtist: "Sobre o artista",
      aboutTeaser:
        "Dioleny Intya, artista plástico angolano reconhecido pela UNAP, e amplamente conhecido como “O Abstrato Doido”.",
      agenda: "Agenda",
      nextEvent: "Próximo Evento",
      lastEvent: "Último Evento",
      viewAgenda: "Ver Agenda",
      noEvents: "Sem eventos agendados",
      fullAgenda: "Ver agenda completa",
      priceOnRequest: "Preço sob consulta",
    },
    gallery: {
      title: "Galeria",
      state: "Estado",
      size: "Tamanho",
      technique: "Técnica",
      dimensions: "Dimensões",
      price: "Preço",
      noWorks: "Nenhuma obra encontrada",
      seeAll: "Ver todas",
      detailsOf: "Ver detalhes de",
      photoOf: "Ver foto",
      enlargedImageOf: "Imagem ampliada",
      closeEnlarged: "Fechar imagem ampliada",
      zoomIn: "Aumentar zoom",
      zoomOut: "Reduzir zoom",
      resetZoom: "Repor zoom",
      moreInfo: "Saber mais",
      workSold: "Obra vendida",
      discount: "desconto",
    },
    agenda: {
      eyebrow: "Eventos",
      title: "Agenda",
      upcoming: "Próximos Eventos",
      past: "Eventos Passados",
      noUpcoming: "Sem eventos futuros agendados",
      noPast: "Sem eventos anteriores",
      upcomingEvent: "Próximo Evento",
      completedEvent: "Evento Realizado",
    },
    blog: {
      eyebrow: "Pense Comigo",
      title: "Opiniões & Reflexões",
      readMore: "Ler mais",
      noPosts: "Sem artigos publicados",
      comeBack: "Volte em breve",
    },
    blogPost: {
      back: "Voltar às Opiniões",
      notFound: "Artigo não encontrado",
      goBack: "Voltar",
    },
    about: {
      paragraph1:
        "O Abstrato Doido - Dioleny Intya - é um artista plástico angolano cuja prática se desenvolve através da abstração como forma de investigar as contradições da condição humana, a espiritualidade e as escolhas que moldam quem somos. As suas obras não procuram oferecer respostas, mas criar um espaço onde o espectador possa confrontar as próprias perguntas.",
      paragraph2:
        "Embora tenha iniciado a sua carreira profissional a poucos anos, a sua relação com a abstração começou muito antes, literalmente aos 6 anos. Cresceu no Lubango, no sul de Angola, longe dos grandes centros culturais e sem conhecer um único artista plástico. Ainda criança, enchia cadernos de rascunhos, fascinava-se por formas distorcidas, rachaduras nas paredes e imagens que sugeriam mais do que explicavam. Só anos mais tarde percebeu que aquela linguagem já tinha um nome. A abstração nunca foi uma escolha consciente. Foi a forma como sempre viu o mundo.",
      paragraph3:
        "Depois de iniciar a sua produção artística, decidiu deixar a cidade onde vivia e mudar-se para Luanda para dedicar-se integralmente à construção de uma carreira de longo prazo. Desde então, participou em diversas exposições coletivas, integrou duas edições da Luanda Feira de Arte, o principal evento de arte contemporânea de Angola, e apresentou a sua primeira exposição individual em formato digital, criada de forma independente quando ainda não encontrava espaço nas galerias tradicionais. As suas obras integram coleções particulares em países como Angola, Portugal, Brasil, Espanha, Moçambique e África do Sul.",
      paragraph4:
        "A exposição O Jardim de Barrabás, a sua primeira individual presencial em galeria, marca um novo momento da sua trajetória e o início público de uma investigação artística que pretende desenvolver ao longo das próximas décadas. Para Dioleny, cada obra é um capítulo de uma mesma pesquisa. Não sobre aquilo que sabemos a respeito de nós mesmos, mas sobre o instante em que percebemos que somos muito mais contraditórios do que imaginávamos.",
    },
    courses: {
      eyebrow: "Aprendizagem",
      title: "Cursos",
      videoUnavailable: "Vídeo não disponível",
      lessons: "aulas",
      lesson: "aula",
      accessPrompt: "Insere a chave de acesso para ver as aulas",
      accessKey: "Chave de acesso",
      wrongKey: "Chave incorrecta. Tenta novamente.",
      checking: "A verificar...",
      unlock: "Desbloquear",
      noAccess: "Se não tem acesso a este curso,",
      participate: "clique aqui para Participar",
      noLessons: "Este curso ainda não tem aulas disponíveis.",
      availableSoon: "Cursos disponíveis em breve",
      preparing: "Estamos a preparar conteúdo especial para ti. Volta em breve para saber mais.",
      lessonsTitle: "Aulas",
    },
    footer: {
      contacts: "Contactos",
      social: "Redes Sociais",
      rights: "Todos os direitos reservados.",
    },
  },
  en: {
    nav: {
      home: "Home",
      gallery: "Gallery",
      agenda: "Schedule",
      about: "About",
      courses: "Courses",
      language: "Language",
      menu: "Menu",
      whatsapp: "WhatsApp",
    },
    common: {
      close: "Close",
      previous: "Previous",
      next: "Next",
      view: "View",
      description: "Description",
      available: "Available",
      availablePlural: "Available",
      sold: "Sold",
      soldFemale: "Sold",
      soldPlural: "Sold",
      large: "Large",
      small: "Small",
      largePlural: "Large",
      smallPlural: "Small",
      priceOnRequest: "Price on request",
      interested: "Interested",
      realized: "Completed",
    },
    home: {
      viewWorks: "View Works",
      galleryHighlights: "Gallery Highlights",
      viewAll: "View all",
      viewAllWorks: "View all works",
      worksSoon: "Works will be added soon",
      aboutArtist: "About the artist",
      aboutTeaser:
        "Dioleny Intya, an Angolan visual artist recognised by UNAP and widely known as “O Abstrato Doido”.",
      agenda: "Schedule",
      nextEvent: "Next Event",
      lastEvent: "Latest Event",
      viewAgenda: "View Schedule",
      noEvents: "No events scheduled",
      fullAgenda: "View full schedule",
      priceOnRequest: "Price on request",
    },
    gallery: {
      title: "Gallery",
      state: "Status",
      size: "Size",
      technique: "Technique",
      dimensions: "Dimensions",
      price: "Price",
      noWorks: "No works found",
      seeAll: "View all",
      detailsOf: "View details of",
      photoOf: "View photo",
      enlargedImageOf: "Enlarged image",
      closeEnlarged: "Close enlarged image",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      resetZoom: "Reset zoom",
      moreInfo: "More information",
      workSold: "Work sold",
      discount: "discount",
    },
    agenda: {
      eyebrow: "Events",
      title: "Schedule",
      upcoming: "Upcoming Events",
      past: "Past Events",
      noUpcoming: "No upcoming events scheduled",
      noPast: "No past events",
      upcomingEvent: "Upcoming Event",
      completedEvent: "Completed Event",
    },
    blog: {
      eyebrow: "Think With Me",
      title: "Opinions & Reflections",
      readMore: "Read more",
      noPosts: "No articles published",
      comeBack: "Come back soon",
    },
    blogPost: {
      back: "Back to Opinions",
      notFound: "Article not found",
      goBack: "Go back",
    },
    about: {
      paragraph1:
        "O Abstrato Doido - Dioleny Intya - is an Angolan visual artist whose practice uses abstraction to investigate the contradictions of the human condition, spirituality, and the choices that shape who we are. His works do not seek to offer answers, but to create a space where viewers can confront their own questions.",
      paragraph2:
        "Although he began his professional career only a few years ago, his relationship with abstraction started much earlier, literally at the age of six. He grew up in Lubango, in southern Angola, far from the major cultural centres and without knowing a single visual artist. As a child, he filled notebooks with sketches and was fascinated by distorted forms, cracks in walls, and images that suggested more than they explained. Only years later did he realise that this language already had a name. Abstraction was never a conscious choice. It was the way he had always seen the world.",
      paragraph3:
        "After beginning his artistic production, he decided to leave the city where he lived and move to Luanda to dedicate himself fully to building a long-term career. Since then, he has taken part in several group exhibitions, participated in two editions of the Luanda Art Fair, Angola’s leading contemporary art event, and presented his first independent digital solo exhibition when he had not yet found a place in traditional galleries. His works are held in private collections in Angola, Portugal, Brazil, Spain, Mozambique, and South Africa.",
      paragraph4:
        "The exhibition O Jardim de Barrabás, his first in-person solo exhibition in a gallery, marks a new moment in his journey and the public beginning of an artistic investigation he intends to develop over the coming decades. For Dioleny, each work is a chapter in the same research. Not about what we know about ourselves, but about the moment we realise that we are far more contradictory than we imagined.",
    },
    courses: {
      eyebrow: "Learning",
      title: "Courses",
      videoUnavailable: "Video unavailable",
      lessons: "lessons",
      lesson: "lesson",
      accessPrompt: "Enter the access key to view the lessons",
      accessKey: "Access key",
      wrongKey: "Incorrect key. Try again.",
      checking: "Checking...",
      unlock: "Unlock",
      noAccess: "If you do not have access to this course,",
      participate: "click here to join",
      noLessons: "This course has no lessons available yet.",
      availableSoon: "Courses available soon",
      preparing: "We are preparing special content for you. Come back soon to find out more.",
      lessonsTitle: "Lessons",
    },
    footer: {
      contacts: "Contacts",
      social: "Social Media",
      rights: "All rights reserved.",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      gallery: "Galerie",
      agenda: "Agenda",
      about: "À propos",
      courses: "Cours",
      language: "Langue",
      menu: "Menu",
      whatsapp: "WhatsApp",
    },
    common: {
      close: "Fermer",
      previous: "Précédente",
      next: "Suivante",
      view: "Voir",
      description: "Description",
      available: "Disponible",
      availablePlural: "Disponibles",
      sold: "Vendu",
      soldFemale: "Vendue",
      soldPlural: "Vendues",
      large: "Grande",
      small: "Petite",
      largePlural: "Grandes",
      smallPlural: "Petites",
      priceOnRequest: "Prix sur demande",
      interested: "Je suis intéressé",
      realized: "Réalisé",
    },
    home: {
      viewWorks: "Voir les œuvres",
      galleryHighlights: "Œuvres à la une",
      viewAll: "Voir tout",
      viewAllWorks: "Voir toutes les œuvres",
      worksSoon: "Les œuvres seront bientôt ajoutées",
      aboutArtist: "À propos de l'artiste",
      aboutTeaser:
        "Dioleny Intya, artiste plasticien angolais reconnu par l’UNAP et largement connu sous le nom de « O Abstrato Doido ».",
      agenda: "Agenda",
      nextEvent: "Prochain événement",
      lastEvent: "Dernier événement",
      viewAgenda: "Voir l’agenda",
      noEvents: "Aucun événement programmé",
      fullAgenda: "Voir l’agenda complet",
      priceOnRequest: "Prix sur demande",
    },
    gallery: {
      title: "Galerie",
      state: "État",
      size: "Taille",
      technique: "Technique",
      dimensions: "Dimensions",
      price: "Prix",
      noWorks: "Aucune œuvre trouvée",
      seeAll: "Tout voir",
      detailsOf: "Voir les détails de",
      photoOf: "Voir la photo",
      enlargedImageOf: "Image agrandie",
      closeEnlarged: "Fermer l’image agrandie",
      zoomIn: "Agrandir",
      zoomOut: "Réduire",
      resetZoom: "Réinitialiser le zoom",
      moreInfo: "En savoir plus",
      workSold: "Œuvre vendue",
      discount: "remise",
    },
    agenda: {
      eyebrow: "Événements",
      title: "Agenda",
      upcoming: "Prochains événements",
      past: "Événements passés",
      noUpcoming: "Aucun événement à venir",
      noPast: "Aucun événement passé",
      upcomingEvent: "Prochain événement",
      completedEvent: "Événement réalisé",
    },
    blog: {
      eyebrow: "Pensez avec moi",
      title: "Opinions & réflexions",
      readMore: "Lire la suite",
      noPosts: "Aucun article publié",
      comeBack: "Revenez bientôt",
    },
    blogPost: {
      back: "Retour aux opinions",
      notFound: "Article introuvable",
      goBack: "Retour",
    },
    about: {
      paragraph1:
        "O Abstrato Doido - Dioleny Intya - est un artiste plasticien angolais dont la pratique utilise l’abstraction pour explorer les contradictions de la condition humaine, la spiritualité et les choix qui façonnent ce que nous sommes. Ses œuvres ne cherchent pas à offrir des réponses, mais à créer un espace où le spectateur peut confronter ses propres questions.",
      paragraph2:
        "Bien qu’il ait commencé sa carrière professionnelle il y a seulement quelques années, sa relation avec l’abstraction a commencé bien plus tôt, littéralement à l’âge de six ans. Il a grandi à Lubango, dans le sud de l’Angola, loin des grands centres culturels et sans connaître un seul artiste plasticien. Enfant, il remplissait des carnets de croquis et se passionnait pour les formes déformées, les fissures des murs et les images qui suggéraient plus qu’elles n’expliquaient. Ce n’est que des années plus tard qu’il a compris que ce langage avait déjà un nom. L’abstraction n’a jamais été un choix conscient. C’était sa façon de voir le monde.",
      paragraph3:
        "Après avoir commencé sa production artistique, il a décidé de quitter la ville où il vivait et de s’installer à Luanda afin de se consacrer pleinement à la construction d’une carrière à long terme. Depuis, il a participé à plusieurs expositions collectives, à deux éditions de la Luanda Art Fair, le principal événement d’art contemporain d’Angola, et a présenté sa première exposition individuelle numérique, créée de manière indépendante alors qu’il ne trouvait pas encore sa place dans les galeries traditionnelles. Ses œuvres font partie de collections privées en Angola, au Portugal, au Brésil, en Espagne, au Mozambique et en Afrique du Sud.",
      paragraph4:
        "L’exposition O Jardim de Barrabás, sa première exposition individuelle en présentiel dans une galerie, marque un nouveau moment de son parcours et le début public d’une recherche artistique qu’il souhaite développer au cours des prochaines décennies. Pour Dioleny, chaque œuvre est un chapitre d’une même recherche. Non pas sur ce que nous savons de nous-mêmes, mais sur l’instant où nous comprenons que nous sommes bien plus contradictoires que nous ne l’imaginions.",
    },
    courses: {
      eyebrow: "Apprentissage",
      title: "Cours",
      videoUnavailable: "Vidéo indisponible",
      lessons: "cours",
      lesson: "cours",
      accessPrompt: "Saisissez la clé d’accès pour voir les cours",
      accessKey: "Clé d’accès",
      wrongKey: "Clé incorrecte. Réessayez.",
      checking: "Vérification...",
      unlock: "Déverrouiller",
      noAccess: "Si vous n’avez pas accès à ce cours,",
      participate: "cliquez ici pour participer",
      noLessons: "Ce cours ne contient pas encore de leçons disponibles.",
      availableSoon: "Cours bientôt disponibles",
      preparing: "Nous préparons un contenu spécial pour vous. Revenez bientôt pour en savoir plus.",
      lessonsTitle: "Cours",
    },
    footer: {
      contacts: "Contacts",
      social: "Réseaux sociaux",
      rights: "Tous droits réservés.",
    },
  },
} as const;

type TranslationKey = {
  [Section in keyof typeof messages.pt]: `${Section}.${keyof (typeof messages.pt)[Section] & string}`;
}[keyof typeof messages.pt];

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  locale: string;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "pt";
    const saved = window.localStorage.getItem("o-abstrato-doido-language");
    return saved === "en" || saved === "fr" || saved === "pt" ? saved : "pt";
  });

  useEffect(() => {
    window.localStorage.setItem("o-abstrato-doido-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: TranslationKey) => {
      const [section, item] = key.split(".") as [keyof typeof messages.pt, string];
      const localizedSection = messages[language][section] as Record<string, string>;
      const defaultSection = messages.pt[section] as Record<string, string>;
      return localizedSection[item] ?? defaultSection[item] ?? key;
    };
    return {
      language,
      setLanguage,
      locale: language === "pt" ? "pt-PT" : language === "fr" ? "fr-FR" : "en-GB",
      t,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}