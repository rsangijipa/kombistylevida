"use client";

import React, { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";
import { Recipe } from "@/types/firestore";

const RECIPES_DATA: Recipe[] = [
    {
        id: "kombujito-classico",
        slug: "kombujito-classico",
        title: "Kombujito Clássico (Mojito de Kombucha)",
        category: "Coquetel (Com Álcool)",
        difficulty: "Fácil",
        timeMinutes: 5,
        servings: "1 drink",
        excerpt: "Uma releitura probiótica do clássico Mojito cubano. A refrescância da hortelã encontra a efervescência natural da Kombucha de Limão.",
        image: "/images/recipes/recipe_kombujito_1768658008991.png",
        tags: ["Refrescante", "Clássico", "Limão", "Hortelã"],
        kombuchaBase: "Limão & Gengibre",
        kombuchaFlavorSuggested: ["Limão", "Original", "Hortelã"],
        ingredients: [
            "100ml de Kombucha de Limão",
            "50ml de Rum Branco",
            "10 folhas de hortelã fresca",
            "1 colher de sopa de açúcar (opcional)",
            "Gelo a gosto",
            "1 rodela de limão para decorar"
        ],
        steps: [
            "Em um copo alto, macere levemente as folhas de hortelã com o açúcar (se usar).",
            "Adicione o rum e misture bem.",
            "Encha o copo com gelo até a borda.",
            "Complete com a Kombucha de Limão gelada.",
            "Misture suavemente com uma colher bailarina para não perder o gás.",
            "Decore com o ramo de hortelã e a rodela de limão."
        ],
        tips: [
            "Não esmague a hortelã com força, apenas pressione para liberar os óleos essenciais sem amargar.",
            "Use gelo de boa qualidade para não aguar o drink rapidamente."
        ],
        pairings: ["Petiscos leves", "Frutos do mar", "Dias de sol"],
        hasAlcohol: true,
        disclaimer: "Se beber, não dirija. Aprecie com moderação.",
        ctaWhatsAppText: "Olá! Adorei o Kombujito! Quero pedir Kombucha de Limão para fazer em casa.",
        status: "PUBLISHED",
        featuredRank: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "spritz-maracuja-curcuma",
        slug: "spritz-maracuja-curcuma",
        title: "Spritz Solar de Maracujá & Cúrcuma",
        category: "Coquetel (Com Álcool)",
        difficulty: "Médio",
        timeMinutes: 8,
        servings: "1 taça",
        excerpt: "Um brinde ao pôr do sol. A acidez do maracujá e o toque terroso da cúrcuma criam um perfil de sabor complexo e vibrante.",
        image: "/images/recipes/recipe_spritz_maracuja_1768658242030.png",
        tags: ["Tropical", "Maracujá", "Cúrcuma", "Vibrante"],
        kombuchaBase: "Maracujá",
        kombuchaFlavorSuggested: ["Maracujá", "Cúrcuma"],
        ingredients: [
            "120ml de Kombucha de Maracujá",
            "60ml de Espumante Brut ou Prosecco",
            "30ml de Água com Gás",
            "Fatias de laranja",
            "Gelo",
            "Ramo de alecrim para decorar"
        ],
        steps: [
            "Encha uma taça grande de vinho com bastante gelo.",
            "Adicione o espumante e depois a Kombucha.",
            "Finalize com um toque de água com gás.",
            "Decore com uma fatia de laranja dentro da taça e o ramo de alecrim.",
            "Aperte levemente o alecrim antes de colocar para liberar o aroma."
        ],
        tips: [
            "A cúrcuma já está presente na nossa Kombucha exclusiva, trazendo cor e antioxidantes.",
            "Para uma versão sem álcool, substitua o espumante por mais água com gás ou tônica."
        ],
        pairings: ["Brunch", "Queijos suaves", "Saladas cítricas"],
        hasAlcohol: true,
        disclaimer: "Contém álcool.",
        ctaWhatsAppText: "Oi! Quero encomendar a Kombucha de Maracujá para fazer o Spritz Solar!",
        status: "PUBLISHED",
        featuredRank: 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "hibiscus-ginger-beer",
        slug: "hibiscus-ginger-beer",
        title: "Hibiscus Ginger Beer (Mocktail)",
        category: "Mocktail (Sem Álcool)",
        difficulty: "Fácil",
        timeMinutes: 5,
        servings: "1 caneca",
        excerpt: "Picância e elegância. Um drink sem álcool que não deve nada aos clássicos, perfeito para dias frios ou quentes.",
        image: "/images/recipes/recipe_hibiscus_ginger_beer_1768657992427.png",
        tags: ["Sem Álcool", "Picante", "Gengibre", "Hibisco"],
        kombuchaBase: "Hibisco & Gengibre",
        kombuchaFlavorSuggested: ["Hibisco", "Gengibre"],
        ingredients: [
            "150ml de Kombucha de Hibisco com Gengibre",
            "Suco de 1/2 limão tahiti",
            "Gelo",
            "Fatias finas de gengibre fresco",
            "1 flor de hibisco desidratada (opcional)"
        ],
        steps: [
            "Em uma caneca de cobre (ou copo baixo), coloque o suco de limão e o gelo.",
            "Complete com a Kombucha de Hibisco & Gengibre.",
            "Mexa delicadamente.",
            "Decore com as fatias de gengibre e a flor de hibisco."
        ],
        tips: [
            "Sirva na caneca de cobre para manter a temperatura ideal por mais tempo.",
            "O gengibre ajuda na digestão, tornando este drink perfeito para após as refeições."
        ],
        pairings: ["Comida asiática", "Pratos condimentados", "Hambúrguer vegetariano"],
        hasAlcohol: false,
        disclaimer: "",
        ctaWhatsAppText: "Olá! Quero provar a Kombucha de Hibisco com Gengibre que vi na receita!",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "smoothie-manga",
        slug: "smoothie-manga",
        title: "Smoothie Tropical de Manga & Probióticos",
        category: "Sobremesas",
        difficulty: "Fácil",
        timeMinutes: 5,
        servings: "2 copos",
        excerpt: "Cremosidade e saúde em um copo. Café da manhã ou lanche da tarde turbinado com probióticos vivos.",
        image: "/images/recipes/recipe_smoothie_manga_1768658268695.png",
        tags: ["Café da Manhã", "Saudável", "Cremoso", "Manga"],
        kombuchaBase: "Original ou Manga",
        kombuchaFlavorSuggested: ["Original", "Manga"],
        ingredients: [
            "200ml de Kombucha Original (ou Manga)",
            "1 manga madura congelada em cubos",
            "1 banana congelada",
            "1 colher de chá de mel (opcional)",
            "Hortelã para decorar"
        ],
        steps: [
            "No liquidificador, coloque a Kombucha, a manga e a banana congeladas.",
            "Bata até obter uma consistência cremosa e homogênea.",
            "Se necessário, adicione um pouco mais de Kombucha para ajudar a bater.",
            "Sirva imediatamente em copos altos decorados com hortelã."
        ],
        tips: [
            "Usar as frutas congeladas dispensa o uso de gelo e deixa a textura parecida com sorvete.",
            "A banana neutraliza a acidez e adiciona potássio."
        ],
        pairings: ["Granola caseira", "Panquecas de aveia", "Pós-treino"],
        hasAlcohol: false,
        disclaimer: "",
        ctaWhatsAppText: "Oi! Preciso repor meu estoque de Kombucha Original para meus smoothies!",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "kombucha-mule",
        slug: "kombucha-mule",
        title: "Moscow Mule de Kombucha",
        category: "Coquetel (Com Álcool)",
        difficulty: "Médio",
        timeMinutes: 7,
        servings: "1 caneca",
        excerpt: "O queridinho dos bares, agora na versão fermentada. A espuma de gengibre encontra o par perfeito.",
        image: "/images/recipes/recipe_kombucha_mule_1768658341920.png",
        tags: ["Clássico", "Gengibre", "Vodka", "Espuma"],
        kombuchaBase: "Gengibre",
        kombuchaFlavorSuggested: ["Gengibre"],
        ingredients: [
            "100ml de Kombucha de Gengibre",
            "50ml de Vodka",
            "20ml de xarope de açúcar simples",
            "Suco de meio limão",
            "Espuma de gengibre (opcional) ou mais Kombucha para completar"
        ],
        steps: [
            "Em uma caneca com gelo, adicione a vodka, o limão e o xarope.",
            "Mexa bem para gelar.",
            "Complete com a Kombucha de Gengibre.",
            "Se tiver, finalize com a espuma de gengibre por cima.",
            "Decore com uma fatia de limão desidratado."
        ],
        tips: [
            "A nossa Kombucha de Gengibre já tem bastanteimoneno e gingerol, então o sabor fica super intenso naturalmente.",
            "Se não tiver espuma, não tem problema, o sabor está garantido."
        ],
        pairings: ["Happy Hour", "Petiscos de boteco", "Noites quentes"],
        hasAlcohol: true,
        disclaimer: "Contém álcool.",
        ctaWhatsAppText: "Quero Kombucha de Gengibre para fazer Moscow Mule!",
        status: "PUBLISHED",
        featuredRank: 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "mexican-mule",
        slug: "mexican-mule",
        title: "Mexican Mule (Tequila & Kombucha)",
        category: "Coquetel (Com Álcool)",
        difficulty: "Médio",
        timeMinutes: 7,
        servings: "1 caneca",
        excerpt: "Uma variação picante e latina. Tequila, limão e a nossa Kombucha criam uma festa no paladar.",
        image: "/images/recipes/recipe_mexican_mule_1768658355776.png",
        tags: ["Tequila", "Latino", "Festa", "Intenso"],
        kombuchaBase: "Limão ou Gengibre",
        kombuchaFlavorSuggested: ["Limão", "Gengibre"],
        ingredients: [
            "100ml de Kombucha de Limão (ou Gengibre)",
            "50ml de Tequila Prata",
            "Suco de meio limão",
            "Fatias de jalapeño (opcional, para os fortes)",
            "Gelo"
        ],
        steps: [
            "Encha um copo baixo ou caneca com gelo.",
            "Adicione a tequila e o suco de limão.",
            "Complete com a Kombucha.",
            "Para um toque extra, esfregue levemente a borda do copo com limão e sal temperado.",
            "Decore com uma rodela de jalapeño."
        ],
        tips: [
            "A tequila prata é mais neutra e combina melhor aqui.",
            "Cuidado com o jalapeño, ele pode roubar a cena se deixar muito tempo."
        ],
        pairings: ["Tacos", "Guacamole", "Nachos"],
        hasAlcohol: true,
        disclaimer: "Contém álcool. Arriba!",
        ctaWhatsAppText: "Ola! Vou fazer uma noite mexicana, preciso de Kombucha!",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "gin-hibisco",
        slug: "gin-hibisco",
        title: "Gin Tônica Botânico de Hibisco",
        category: "Coquetel (Com Álcool)",
        difficulty: "Fácil",
        timeMinutes: 5,
        servings: "1 taça",
        excerpt: "Sofisticação rubi. O zimbro do gin dança com as notas florais e ácidas do hibisco.",
        image: "/images/recipes/recipe_gin_hibisco_1768658368689.png",
        tags: ["Gin", "Floral", "Sofisticado", "Jantar"],
        kombuchaBase: "Hibisco",
        kombuchaFlavorSuggested: ["Hibisco"],
        ingredients: [
            "100ml de Kombucha de Hibisco",
            "50ml de Gin (London Dry)",
            "Água tônica (opcional, ou use só Kombucha)",
            "Especiarias: Zimbro, Cardamomo",
            "Gelo"
        ],
        steps: [
            "Gele a taça de gin previamente.",
            "Coloque o gelo e o gin.",
            "Adicione as especiarias e mexa para liberar aroma.",
            "Complete com a Kombucha de Hibisco delicadamente.",
            "Sirva sem canudo para sentir o aroma das especiarias ao beber."
        ],
        tips: [
            "O hibisco tinge o drink de um vermelho lindo naturalmente.",
            "Não precisa adoçar."
        ],
        pairings: ["Risotos", "Massas leves", "Carpaccio"],
        hasAlcohol: true,
        disclaimer: "Contém álcool.",
        ctaWhatsAppText: "Quero Kombucha de Hibisco para meus drinks de Gin!",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "ceviche-peixe",
        slug: "ceviche-peixe",
        title: "Ceviche com Marinada de Kombucha",
        category: "Gastronomia (Salgados)",
        difficulty: "Avançado",
        timeMinutes: 30,
        servings: "2 pessoas",
        excerpt: "Uma revolução na cozinha. Usamos a acidez natural da Kombucha para 'cozinhar' o peixe delicadamente.",
        image: "/images/recipes/recipe_ceviche_1768658023886.png",
        tags: ["Jantar", "Frutos do Mar", "Gourmet", "Leve"],
        kombuchaBase: "Limão ou Original",
        kombuchaFlavorSuggested: ["Limão", "Original"],
        ingredients: [
            "200ml de Kombucha de Limão (bem ácida)",
            "300g de peixe branco fresco (Tilápia, Robalo) em cubos",
            "1 cebola roxa fatiada finamente",
            "Coentro fresco picado",
            "Pimenta dedo-de-moça a gosto",
            "Sal e Pimenta do reino"
        ],
        steps: [
            "Tempere os cubos de peixe com sal e pimenta.",
            "Em uma tigela, cubra o peixe com a Kombucha de Limão.",
            "Leve à geladeira por 15-20 minutos (a kombucha vai marinar o peixe mais lentamente que o limão puro, deixando mais suculento).",
            "Misture a cebola, pimenta e coentro na hora de servir.",
            "Ajuste o sal."
        ],
        tips: [
            "A kombucha traz uma camada de sabor fermentado umami que o limão sozinho não tem.",
            "Use peixe fresquíssimo sempre."
        ],
        pairings: ["Vinho branco", "Kombucha de Maracujá"],
        hasAlcohol: false,
        disclaimer: "Consumo de peixe cru requer peixe fresco e de procedência.",
        ctaWhatsAppText: "Fiquei curiosa com o Ceviche de Kombucha! Quero encomendar.",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "sorbet-limao",
        slug: "sorbet-limao",
        title: "Sorbet Refrescante de Limão & Gengibre",
        category: "Sobremesas",
        difficulty: "Médio",
        timeMinutes: 240,
        servings: "4 porções",
        excerpt: "A sobremesa perfeita para limpar o paladar ou refrescar uma tarde de verão. Sem lactose.",
        image: "/images/recipes/recipe_sorbet_1768658038120.png",
        tags: ["Sobremesa", "Vegano", "Zero Lactose", "Verão"],
        kombuchaBase: "Limão & Gengibre",
        kombuchaFlavorSuggested: ["Limão", "Gengibre"],
        ingredients: [
            "300ml de Kombucha de Limão com Gengibre",
            "100g de açúcar",
            "Suco de 1 limão",
            "Raspas de limão"
        ],
        steps: [
            "Dissolva o açúcar na Kombucha mexendo bem (sem aquecer para não matar os probióticos).",
            "Adicione o suco e as raspas.",
            "Coloque em um recipiente e leve ao freezer.",
            "A cada 1 hora, retire e mexa com um garfo para quebrar os cristais de gelo, até ficar cremoso (aprox. 4 horas).",
            "Sirva em taças geladas."
        ],
        tips: [
            "Se tiver sorveteira, o resultado fica ainda mais cremoso.",
            "Não ferver a mistura preserva as propriedades vivas da kombucha."
        ],
        pairings: ["Final de refeição", "Dias quentes"],
        hasAlcohol: false,
        disclaimer: "",
        ctaWhatsAppText: "Quero fazer o Sorbet! Me manda uma Kombucha de Limão?",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "kombucha-aperol",
        slug: "kombucha-aperol",
        title: "Aperol Spritz com Toque Vivo",
        category: "Coquetel (Com Álcool)",
        difficulty: "Fácil",
        timeMinutes: 5,
        servings: "1 taça",
        excerpt: "O laranja vibrante do verão italiano com o toque saudável da fermentação.",
        image: "/images/recipes/recipe_kombucha_aperol_1768658454107.png",
        tags: ["Aperol", "Verão", "Amargo", "Laranja"],
        kombuchaBase: "Original ou Laranja",
        kombuchaFlavorSuggested: ["Original", "Laranja"],
        ingredients: [
            "100ml de Kombucha Original (ou de Laranja)",
            "50ml de Aperol",
            "50ml de Espumante (opcional, pode substituir por mais Kombucha)",
            "Rodela de laranja Bahia",
            "Bastante gelo"
        ],
        steps: [
            "Em uma taça de vinho grande, coloque gelo até a boca.",
            "Despeje o Aperol.",
            "Adicione a Kombucha e o espumante.",
            "Misture levemente puxando o gelo de baixo para cima.",
            "Decore com a rodela de laranja."
        ],
        tips: [
            "A Kombucha substitui a água com gás da receita original, adicionando complexidade.",
            "Use laranjas doces e frescas."
        ],
        pairings: ["Tábua de frios", "Azeitonas", "Pôr do sol"],
        hasAlcohol: true,
        disclaimer: "Contém álcool.",
        ctaWhatsAppText: "Adoro Aperol! Quero experimentar com Kombucha, vou pedir.",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "drink-antioxidante",
        slug: "drink-antioxidante",
        title: "Drink Antioxidante de Frutas Vermelhas",
        category: "Mocktail (Sem Álcool)",
        difficulty: "Fácil",
        timeMinutes: 5,
        servings: "1 copo",
        excerpt: "Uma explosão de polifenóis e sabor. A cor rubi intensa convida para um brinde à saúde.",
        image: "/images/recipes/recipe_drink_antioxidant_1768658255860.png",
        tags: ["Detox", "Antioxidante", "Sem Álcool", "Frutas Vermelhas"],
        kombuchaBase: "Hibisco ou Uva",
        kombuchaFlavorSuggested: ["Hibisco", "Uva"],
        ingredients: [
            "200ml de Kombucha de Hibisco (ou Uva)",
            "Morangos macerados",
            "Mirtilos inteiros",
            "Hortelã",
            "Gelo"
        ],
        steps: [
            "No fundo do copo, macere levemente os morangos.",
            "Adicione gelo e os mirtilos inteiros.",
            "Complete com a Kombucha.",
            "Misture e decore com um ramo de hortelã fresco."
        ],
        tips: [
            "Pode usar frutas congeladas, elas ajudam a gelar.",
            "Não precisa de açúcar, o doce da fruta equilibra a acidez."
        ],
        pairings: ["Salada de frutas", "Bolos simples", "Manhã de domingo"],
        hasAlcohol: false,
        disclaimer: "",
        ctaWhatsAppText: "Quero uma Kombucha de Hibisco para meu drink detox!",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "sangria-kombucha",
        slug: "sangria-kombucha",
        title: "Sangria Leve de Kombucha",
        category: "Coquetel (Com Álcool)",
        difficulty: "Médio",
        timeMinutes: 10,
        servings: "Jarra (4 pessoas)",
        excerpt: "Perfeita para compartilhar. Menos doce que a tradicional, mais refrescante e cheia de frutas.",
        image: "/images/recipes/recipe_sangria_kombucha_1768658575168.png",
        tags: ["Jarra", "Compartilhar", "Vinho", "Frutas"],
        kombuchaBase: "Uva ou Original",
        kombuchaFlavorSuggested: ["Uva", "Original"],
        ingredients: [
            "300ml de Kombucha de Uva (ou Original)",
            "300ml de Vinho Tinto seco",
            "1 maçã picada",
            "1 laranja picada",
            "Morangos picados",
            "Pau de canela",
            "Gelo"
        ],
        steps: [
            "Em uma jarra, coloque todas as frutas picadas.",
            "Adicione o vinho e a canela. Deixe descansar por 10 min se possível.",
            "Antes de servir, adicione muito gelo e a Kombucha.",
            "Sirva em taças com pedacinhos de fruta em cada uma."
        ],
        tips: [
            "A maceração rápida das frutas no vinho é o segredo.",
            "Use um vinho jovem e frutado."
        ],
        pairings: ["Churrasco", "Almoço de família", "Massas"],
        hasAlcohol: true,
        disclaimer: "Contém álcool.",
        ctaWhatsAppText: "Vou fazer Sangria no almoço! Manda Kombucha de Uva?",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "margarita-kombucha",
        slug: "margarita-kombucha",
        title: "Kombu-Margarita",
        category: "Coquetel (Com Álcool)",
        difficulty: "Médio",
        timeMinutes: 6,
        servings: "1 taça",
        excerpt: "O clássico mexicano com um toque probiótico. A acidez da Kombucha substitui parte do limão com maestria.",
        image: "/images/recipes/recipe_margarita_kombucha_1768658589365.png",
        tags: ["Tequila", "Clássico", "Sal", "Limão"],
        kombuchaBase: "Limão",
        kombuchaFlavorSuggested: ["Limão"],
        ingredients: [
            "60ml de Kombucha de Limão",
            "45ml de Tequila",
            "15ml de Licor de Laranja (Cointreau)",
            "Suco de meio limão",
            "Sal para a borda",
            "Gelo"
        ],
        steps: [
            "Passe limão na borda da taça e mergulhe no sal para fazer a crosta.",
            "Na coqueteleira com gelo, bata a tequila, o licor e o suco de limão.",
            "Coe para a taça (com gelo novo se preferir).",
            "Complete (top up) com a Kombucha de Limão.",
            "Decore com uma fatia de limão."
        ],
        tips: [
            "Não bata a kombucha na coqueteleira, ela entra no final para manter o gás.",
            "Use sal marinho de boa qualidade."
        ],
        pairings: ["Comida mexicana", "Petiscos fritos"],
        hasAlcohol: true,
        disclaimer: "Contém álcool.",
        ctaWhatsAppText: "Arriba! Quero Kombucha de Limão para minha Margarita!",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "vinagrete-kombucha",
        slug: "vinagrete-kombucha",
        title: "Vinagrete Vivo para Saladas",
        category: "Gastronomia (Salgados)",
        difficulty: "Fácil",
        timeMinutes: 5,
        servings: "Pote pequeno",
        excerpt: "Troque o vinagre comum por probióticos. Um molho que traz vida e saúde para suas folhas verdes.",
        image: "/images/recipes/recipe_vinagrete_kombucha_1768658603418.png",
        tags: ["Molho", "Salada", "Saudável", "Vegano"],
        kombuchaBase: "Original ou Maracujá",
        kombuchaFlavorSuggested: ["Original", "Maracujá"],
        ingredients: [
            "100ml de Kombucha Original (que já fermentou bastante e está ácida)",
            "50ml de Azeite de Oliva Extra Virgem",
            "Sal",
            "Pimenta do reino",
            "Ervas secas (orégano, manjericão)"
        ],
        steps: [
            "Em um pote de vidro com tampa, coloque todos os ingredientes.",
            "Feche e chacoalhe vigorosamente até emulsionar (ficar cremoso).",
            "Prove e ajuste o sal.",
            "Sirva sobre a salada imediatamente."
        ],
        tips: [
            "Se sua Kombucha estiver muito doce, use menos ou deixe ela fermentar mais tempo fora da geladeira antes de usar.",
            "Dura 3 dias na geladeira."
        ],
        pairings: ["Salada de folhas", "Carpaccio", "Legumes grelhados"],
        hasAlcohol: false,
        disclaimer: "",
        ctaWhatsAppText: "Adorei a ideia do Vinagrete! Quero encomendar.",
        status: "PUBLISHED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

export default function AdminSeedPage() {
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        if (!confirm("Isso irá sobrescrever as receitas com os mesmos IDs. Continuar?")) return;
        setLoading(true);
        setStatus("Iniciando seed...");

        try {
            let count = 0;
            for (const recipe of RECIPES_DATA) {
                await setDoc(doc(db, "recipes", recipe.id), recipe);
                count++;
                setStatus(`Semeando... ${count}/${RECIPES_DATA.length}: ${recipe.title}`);
            }
            setStatus(`Sucesso! ${count} receitas semeadas.`);
        } catch (e) {
            console.error(e);
            setStatus("Erro ao semear. Verifique o console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-olive">Seed de Receitas</h1>
            <p className="mb-6 text-ink/70">
                Esta página é uma ferramenta administrativa para popular o banco de dados com as 14 receitas iniciais contendo as imagens geradas e textos completos.
            </p>

            <div className="bg-paper2 p-6 rounded-xl border border-olive/10 mb-6">
                <h2 className="font-bold mb-2">Dados a serem inseridos:</h2>
                <ul className="list-disc pl-5 text-sm space-y-1 h-40 overflow-y-auto">
                    {RECIPES_DATA.map(r => (
                        <li key={r.id}>{r.title} ({r.category})</li>
                    ))}
                </ul>
            </div>

            <button
                onClick={handleSeed}
                disabled={loading}
                className="bg-olive text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider disabled:opacity-50 hover:bg-olive/90 transition-colors w-full md:w-auto"
            >
                {loading ? "Semeando..." : "Executar Seed"}
            </button>

            {status && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-sm font-mono border border-gray-200">
                    {status}
                </div>
            )}
        </div>
    );
}
