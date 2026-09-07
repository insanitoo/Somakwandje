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
      viewGallery: "Ver Galeria",
      heroStatement: "“Questionar o olhar e dar espaço ao que o silêncio esconde.”",
      photoGalleryLabel: "Galeria de imagens",
      awardEyebrow: "Reconhecimento",
      awardTitle: "2.º lugar no Prémio Embaixada de Espanha",
      awardDescription:
        "Em 2025, Victor Eurico Somakwendje conquistou o segundo lugar na categoria de pintura do Prémio Embaixada de Espanha, em parceria com a UNAP.",
      galleryEyebrow: "Seleção",
      galleryHighlights: "Obras que permanecem",
      viewAll: "Ver todas",
      viewAllWorks: "Ver todas as obras",
      worksSoon: "As obras serão adicionadas em breve",
      aboutArtist: "Sobre o artista",
      aboutTeaser:
        "Victor Eurico Somakwendje nasceu aos 28 de maio, na comuna de Lândana, município de Cacongo, província Cabinda/Angola.",
      agenda: "Agenda",
      featuredEvent: "Em destaque",
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
      biographyTitle: "Biografia",
      statementTitle: "Statement artístico",
      paragraph1:
        "Victor Eurico Somakwendje nasceu a 28 de maio, na comuna de Lândana, município de Cacongo, em Cabinda. Aos cinco anos mudou-se para o Cubal, em Benguela, onde concluiu o ensino primário. Em 2015, foi para Benguela-Sede continuar os estudos.",
      paragraph2:
        "Desde cedo, revelou paixão pelo desenho. Em 2016 conheceu o mestre Venâncio Higino, decisivo no seu desenvolvimento técnico e expressivo. Em 2022 iniciou a prática profissional, passando da pintura publicitária para a tela, os ténis e as T-shirts. Participou em exposições coletivas e, em 2025, conquistou o segundo lugar no concurso de artes visuais da Embaixada de Espanha, em parceria com a UNAP. Atualmente estuda na Faculdade de Artes da Universidade de Luanda e vive em Luanda.",
      paragraph3:
        "Sou um artista visual angolano que utiliza o corpo feminino como campo de investigação, explorando as relações entre desejo, poder e silêncio. A partir de uma linguagem surrealista e simbólica, interrogo o male gaze, o silenciamento social e os padrões que o olhar masculino reproduz. A pintura, a escultura e a apropriação de objetos reais cruzam-se numa prática que aproxima o íntimo do universal.",
      paragraph4:
        "Não procuro oferecer respostas, mas criar perguntas. Através de entrevistas e de imagens fragmentadas, questiono quem controla o corpo feminino, o que acontece quando ele resiste e o que muda quando o homem que olha é obrigado a questionar o próprio olhar.",
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
      tagline: "Arte, memória e questionamento.",
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
      viewGallery: "View Gallery",
      heroStatement: "“Questioning the gaze and making space for what silence conceals.”",
      photoGalleryLabel: "Image gallery",
      awardEyebrow: "Recognition",
      awardTitle: "2nd place at the Embassy of Spain Prize",
      awardDescription:
        "In 2025, Victor Eurico Somakwendje won second place in the painting category of the Embassy of Spain Prize, in partnership with UNAP.",
      galleryEyebrow: "Curated selection",
      galleryHighlights: "Works that remain",
      viewAll: "View all",
      viewAllWorks: "View all works",
      worksSoon: "Works will be added soon",
      aboutArtist: "About the artist",
      aboutTeaser:
        "Victor Eurico Somakwendje was born on 28 May in the commune of Lândana, municipality of Cacongo, Cabinda province, Angola.",
      agenda: "Schedule",
      featuredEvent: "Featured",
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
      biographyTitle: "Biography",
      statementTitle: "Artist statement",
      paragraph1:
        "Victor Eurico Somakwendje was born on 28 May in Lândana, Cacongo, in Cabinda, Angola. At the age of five he moved to Cubal, Benguela, where he completed primary school. In 2015, he moved to Benguela city to continue his studies.",
      paragraph2:
        "He discovered a passion for drawing early on. In 2016 he met his mentor Venâncio Higino, who played an important role in his technical and expressive development. He began working professionally in 2022, moving from advertising painting to canvases, sneakers and T-shirts. After taking part in group exhibitions, he won second place in the 2025 visual arts competition organised by the Embassy of Spain with UNAP. He currently studies at the Faculty of Arts of the University of Luanda.",
      paragraph3:
        "I am an Angolan visual artist who uses the female body as a field of research, exploring the relationships between desire, power and silence. Through a surreal and symbolic language, I question the male gaze, social silencing and the patterns reproduced by the masculine gaze. Painting, sculpture and the appropriation of real objects come together in a practice that connects the intimate with the universal.",
      paragraph4:
        "I do not seek to offer answers, but to create questions. Through interviews and fragmented images, I ask who controls the female body, what happens when it resists, and what changes when the man who looks is forced to question his own gaze.",
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
      tagline: "Art, memory and questioning.",
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
      viewGallery: "Voir la galerie",
      heroStatement: "« Interroger le regard et faire place à ce que le silence dissimule. »",
      photoGalleryLabel: "Galerie d’images",
      awardEyebrow: "Distinction",
      awardTitle: "2e place au Prix de l’Ambassade d’Espagne",
      awardDescription:
        "En 2025, Victor Eurico Somakwendje a remporté la deuxième place dans la catégorie peinture du Prix de l’Ambassade d’Espagne, en partenariat avec l’UNAP.",
      galleryEyebrow: "Sélection",
      galleryHighlights: "Œuvres qui demeurent",
      viewAll: "Voir tout",
      viewAllWorks: "Voir toutes les œuvres",
      worksSoon: "Les œuvres seront bientôt ajoutées",
      aboutArtist: "À propos de l'artiste",
      aboutTeaser:
        "Victor Eurico Somakwendje est né le 28 mai dans la commune de Lândana, municipalité de Cacongo, province de Cabinda, en Angola.",
      agenda: "Agenda",
      featuredEvent: "À la une",
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
      biographyTitle: "Biographie",
      statementTitle: "Statement artistique",
      paragraph1:
        "Victor Eurico Somakwendje est né le 28 mai à Lândana, dans la municipalité de Cacongo, à Cabinda, en Angola. À l’âge de cinq ans, il s’est installé à Cubal, dans la province de Benguela, où il a terminé l’école primaire. En 2015, il a rejoint la ville de Benguela pour poursuivre ses études.",
      paragraph2:
        "Passionné très tôt par le dessin, il rencontre en 2016 son maître Venâncio Higino, qui contribue à son développement technique et expressif. En 2022, il commence à travailler professionnellement, de la peinture publicitaire aux toiles, aux baskets et aux T-shirts. Après plusieurs expositions collectives, il obtient en 2025 la deuxième place du concours d’arts visuels de l’Ambassade d’Espagne, en partenariat avec l’UNAP. Il étudie actuellement à la Faculté des Arts de l’Université de Luanda.",
      paragraph3:
        "Je suis un artiste visuel angolais qui utilise le corps féminin comme champ de recherche, en explorant les relations entre désir, pouvoir et silence. À travers un langage surréaliste et symbolique, j’interroge le male gaze, le silence social et les schémas reproduits par le regard masculin. La peinture, la sculpture et l’appropriation d’objets réels se rencontrent dans une pratique qui relie l’intime à l’universel.",
      paragraph4:
        "Je ne cherche pas à proposer des réponses, mais à faire naître des questions. À travers des entretiens et des images fragmentées, je demande qui contrôle le corps féminin, ce qui se passe lorsqu’il résiste et ce qui change lorsque l’homme qui regarde est contraint d’interroger son propre regard.",
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
      tagline: "Art, mémoire et questionnement.",
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