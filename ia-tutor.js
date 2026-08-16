// ============================================================
// TUTOR DE BIOLOGIA COM IA
// Usa a API da OpenAI quando existe a chave OPENAI_API_KEY.
// Sem chave, responde com o conteúdo das aulas do site.
// ============================================================

const { TEMAS } = require('./conteudos-biologia');

const MODELO_PADRAO = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const URL_OPENAI = 'https://api.openai.com/v1/chat/completions';

const INSTRUCOES = `Você é o BioBot, tutor de Biologia da plataforma BioMentoria.
Responda em português do Brasil, com linguagem simples, para alunos do ensino médio.
Use no máximo 4 parágrafos curtos e dê exemplos quando ajudar.
Se a pergunta não for de Biologia, explique com gentileza que você só ajuda com Biologia.`;

// Conteúdo das aulas, usado quando a IA não está configurada.
const CONTEUDO_AULAS = TEMAS.map((aula) => ({
    tema: aula.tema,
    palavras: aula.palavras,
    texto: aula.secoes.map((secao) => secao.texto).join(' ')
}));

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

// ============================================================
// GERADOR DE AULAS (texto + quiz + exercícios)
// ============================================================

const INSTRUCOES_AULA = `Você cria aulas de Biologia para alunos do ensino médio da plataforma BioMentoria.
Responda SOMENTE com JSON válido, sem markdown, neste formato:
{
  "tema": "nome curto do tema",
  "titulo": "título da aula com um emoji no início",
  "secoes": [{ "subtitulo": "...", "texto": "3 a 5 frases explicando" }],
  "quiz": [{ "pergunta": "...", "respostas": ["a","b","c","d"], "correta": 0 }],
  "exercicios": [{ "pergunta": "...", "alternativas": ["a","b","c"], "correta": 0 }]
}
Use 2 ou 3 seções, 3 perguntas de quiz e 4 exercícios.
"correta" é o índice (começando em 0) da alternativa correta.
As perguntas devem ser respondidas usando apenas o texto das seções.
Escreva em português do Brasil, com linguagem simples e correta.`;

function embaralhar(lista) {
    const copia = lista.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

// Embaralha as alternativas mantendo o índice da resposta correta.
function embaralharAlternativas(questao, campo) {
    const alternativas = questao[campo];
    const correta = alternativas[questao.correta];
    const novas = embaralhar(alternativas);

    return {
        ...questao,
        [campo]: novas,
        correta: novas.indexOf(correta)
    };
}

function gerarAulaDoBanco(temasUsados = []) {
    const usados = temasUsados.map(normalizar);
    const disponiveis = TEMAS.filter((aula) => !usados.includes(normalizar(aula.tema)));
    const lista = disponiveis.length > 0 ? disponiveis : TEMAS;
    const escolhida = lista[Math.floor(Math.random() * lista.length)];

    return {
        tema: escolhida.tema,
        titulo: escolhida.titulo,
        secoes: escolhida.secoes,
        quiz: embaralhar(escolhida.quiz).map((questao) => embaralharAlternativas(questao, 'respostas')),
        exercicios: embaralhar(escolhida.exercicios).map((questao) => embaralharAlternativas(questao, 'alternativas')),
        fonte: 'aulas'
    };
}

function validarAula(aula) {
    const questaoValida = (questao, campo) =>
        questao &&
        typeof questao.pergunta === 'string' &&
        Array.isArray(questao[campo]) &&
        questao[campo].length >= 2 &&
        Number.isInteger(questao.correta) &&
        questao.correta >= 0 &&
        questao.correta < questao[campo].length;

    return Boolean(
        aula &&
        typeof aula.tema === 'string' &&
        typeof aula.titulo === 'string' &&
        Array.isArray(aula.secoes) &&
        aula.secoes.length > 0 &&
        aula.secoes.every((secao) => secao && typeof secao.texto === 'string') &&
        Array.isArray(aula.quiz) &&
        aula.quiz.length > 0 &&
        aula.quiz.every((questao) => questaoValida(questao, 'respostas')) &&
        Array.isArray(aula.exercicios) &&
        aula.exercicios.length > 0 &&
        aula.exercicios.every((questao) => questaoValida(questao, 'alternativas'))
    );
}

async function gerarAulaComOpenAI(temasUsados) {
    const pedido =
        temasUsados.length > 0
            ? `Crie uma aula sobre um tema de Biologia diferente destes que o aluno já estudou: ${temasUsados.join(', ')}.`
            : 'Crie a primeira aula de Biologia do aluno, começando por um tema introdutório.';

    const resposta = await fetch(URL_OPENAI, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: MODELO_PADRAO,
            temperature: 0.7,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: INSTRUCOES_AULA },
                { role: 'user', content: pedido }
            ]
        })
    });

    if (!resposta.ok) {
        const detalhe = await resposta.text();
        throw new Error(`OpenAI respondeu ${resposta.status}: ${detalhe}`);
    }

    const dados = await resposta.json();
    const texto = dados.choices && dados.choices[0] && dados.choices[0].message.content;
    const aula = JSON.parse(texto);

    if (!validarAula(aula)) {
        throw new Error('A IA devolveu uma aula em formato inesperado.');
    }

    return {
        tema: aula.tema,
        titulo: aula.titulo,
        secoes: aula.secoes,
        quiz: aula.quiz,
        exercicios: aula.exercicios,
        fonte: 'ia'
    };
}

async function gerarAula(temasUsados = []) {
    if (!iaConfigurada()) {
        return gerarAulaDoBanco(temasUsados);
    }

    try {
        return await gerarAulaComOpenAI(temasUsados);
    } catch (erro) {
        console.error('Erro ao gerar aula com IA, usando banco de conteúdos:', erro.message);
        return gerarAulaDoBanco(temasUsados);
    }
}

module.exports = { responderPergunta, gerarAula, iaConfigurada };
