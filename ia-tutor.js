// ============================================================
// TUTOR DE BIOLOGIA COM IA
// Usa a API da OpenAI quando existe a chave OPENAI_API_KEY.
// Sem chave, responde com o conteúdo das aulas do site.
// ============================================================

const MODELO_PADRAO = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const URL_OPENAI = 'https://api.openai.com/v1/chat/completions';

const INSTRUCOES = `Você é o BioBot, tutor de Biologia da plataforma BioMentoria.
Responda em português do Brasil, com linguagem simples, para alunos do ensino médio.
Use no máximo 4 parágrafos curtos e dê exemplos quando ajudar.
Se a pergunta não for de Biologia, explique com gentileza que você só ajuda com Biologia.`;

// Conteúdo das aulas, usado quando a IA não está configurada.
const CONTEUDO_AULAS = [
    {
        tema: 'Citologia',
        palavras: ['celula', 'celulas', 'citologia', 'mitocondria', 'nucleo', 'ribossomo', 'procarionte', 'eucarionte', 'organela'],
        texto: 'A célula é a unidade básica dos seres vivos. As células procariontes não têm núcleo delimitado por membrana; as eucariontes têm núcleo organizado. Entre as principais estruturas celulares estão as mitocôndrias, os ribossomos, o complexo golgiense, o retículo endoplasmático e o núcleo, que guarda o material genético.'
    },
    {
        tema: 'Genética',
        palavras: ['genetica', 'gene', 'genes', 'dna', 'hereditariedade', 'mendel', 'ervilha', 'ervilhas', 'cromossomo'],
        texto: 'A Genética estuda a hereditariedade e a transmissão de características. O DNA armazena a informação genética, e os genes são segmentos de DNA que participam da determinação das características. Gregor Mendel, com seus experimentos com ervilhas, estabeleceu princípios básicos da hereditariedade.'
    },
    {
        tema: 'Ecologia',
        palavras: ['ecologia', 'ambiente', 'ecossistema', 'cadeia alimentar', 'populacao', 'comunidade', 'produtor', 'produtores', 'consumidor', 'decompositor'],
        texto: 'A Ecologia estuda as relações dos seres vivos entre si e com o ambiente. Os organismos formam populações, comunidades e ecossistemas. Nas cadeias alimentares, os produtores (como as plantas) fabricam seu alimento, os consumidores se alimentam de outros organismos e os decompositores reciclam a matéria orgânica.'
    },
    {
        tema: 'Evolução',
        palavras: ['evolucao', 'darwin', 'selecao natural', 'mutacao', 'adaptacao', 'especie', 'especies'],
        texto: 'A evolução biológica corresponde às mudanças nas populações ao longo das gerações. Charles Darwin propôs a seleção natural: indivíduos com características vantajosas em um ambiente podem ter maior sucesso reprodutivo. Mutações e recombinação genética também contribuem para a diversidade dos seres vivos.'
    },
    {
        tema: 'Fisiologia Humana',
        palavras: ['fisiologia', 'digestorio', 'digestao', 'respiratorio', 'respiracao', 'circulatorio', 'sangue', 'coracao', 'nervoso', 'sistema'],
        texto: 'A Fisiologia estuda o funcionamento dos organismos. O sistema digestório faz a digestão dos alimentos e a absorção de nutrientes; o respiratório realiza as trocas gasosas; o circulatório transporta sangue, oxigênio e nutrientes; e o nervoso coordena as funções do corpo e as respostas aos estímulos.'
    },
    {
        tema: 'Botânica',
        palavras: ['botanica', 'planta', 'plantas', 'fotossintese', 'raiz', 'raizes', 'caule', 'folha', 'flor', 'fruto', 'semente', 'clorofila'],
        texto: 'A Botânica estuda as plantas, organismos eucariontes, multicelulares e em geral autotróficos. Na fotossíntese, a planta usa energia luminosa para produzir matéria orgânica a partir de água e gás carbônico. As principais estruturas vegetais são raízes, caules, folhas, flores, frutos e sementes.'
    }
];

function normalizar(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
}

function responderComConteudoLocal(pergunta) {
    const perguntaNormalizada = normalizar(pergunta);

    const ranking = CONTEUDO_AULAS.map((aula) => {
        const acertos = aula.palavras.filter((palavra) =>
            perguntaNormalizada.includes(palavra)
        ).length;
        return { aula, acertos };
    }).sort((a, b) => b.acertos - a.acertos);

    const melhor = ranking[0];

    if (!melhor || melhor.acertos === 0) {
        const temas = CONTEUDO_AULAS.map((aula) => aula.tema).join(', ');
        return `Ainda não encontrei esse assunto nas aulas do site. Posso ajudar com: ${temas}. Tente perguntar usando uma palavra do tema, por exemplo "o que é fotossíntese?".`;
    }

    const relacionados = ranking
        .filter((item) => item !== melhor && item.acertos > 0)
        .map((item) => item.aula.tema);

    let resposta = `${melhor.aula.tema}: ${melhor.aula.texto}`;
    if (relacionados.length > 0) {
        resposta += `\n\nVeja também as aulas de ${relacionados.join(' e ')}.`;
    }

    return resposta;
}

async function responderComOpenAI(pergunta) {
    const resposta = await fetch(URL_OPENAI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: MODELO_PADRAO,
            temperature: 0.3,
            max_tokens: 500,
            messages: [
                { role: 'system', content: INSTRUCOES },
                { role: 'user', content: pergunta }
            ]
        })
    });

    if (!resposta.ok) {
        const detalhe = await resposta.text();
        throw new Error(`OpenAI respondeu ${resposta.status}: ${detalhe}`);
    }

    const dados = await resposta.json();
    const texto = dados.choices && dados.choices[0] && dados.choices[0].message.content;

    if (!texto) {
        throw new Error('OpenAI não retornou conteúdo.');
    }

    return texto.trim();
}

function iaConfigurada() {
    return Boolean(process.env.OPENAI_API_KEY);
}

async function responderPergunta(pergunta) {
    if (!iaConfigurada()) {
        return { resposta: responderComConteudoLocal(pergunta), fonte: 'aulas' };
    }

    try {
        return { resposta: await responderComOpenAI(pergunta), fonte: 'ia' };
    } catch (erro) {
        console.error('Erro na IA, usando conteúdo das aulas:', erro.message);
        return { resposta: responderComConteudoLocal(pergunta), fonte: 'aulas' };
    }
}

module.exports = { responderPergunta, iaConfigurada };
