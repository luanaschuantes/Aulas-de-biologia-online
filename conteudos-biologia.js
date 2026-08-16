// ============================================================
// BANCO DE CONTEÚDOS DE BIOLOGIA
// Usado pelo gerador de aulas quando a IA não está configurada
// (ou quando a chamada à IA falha).
// ============================================================

const TEMAS = [
    {
        tema: 'Citologia',
        palavras: ['celula', 'celulas', 'citologia', 'mitocondria', 'nucleo', 'ribossomo', 'procarionte', 'eucarionte', 'organela', 'lisossomo'],
        titulo: '🔬 A célula e suas estruturas',
        secoes: [
            {
                subtitulo: 'A unidade da vida',
                texto: 'A célula é a menor unidade capaz de realizar as funções vitais. Todos os seres vivos são formados por uma célula (unicelulares) ou por muitas células (multicelulares). Células procariontes, como as das bactérias, não têm núcleo delimitado por membrana. Células eucariontes, como as nossas, têm núcleo organizado e diversas organelas.'
            },
            {
                subtitulo: 'Organelas e suas funções',
                texto: 'A mitocôndria realiza a respiração celular e libera energia. Os ribossomos produzem proteínas. O retículo endoplasmático transporta substâncias e o complexo golgiense empacota e distribui secreções. Os lisossomos fazem a digestão intracelular e o núcleo guarda o DNA, comandando a célula.'
            }
        ],
        quiz: [
            { pergunta: 'Qual organela realiza a respiração celular?', respostas: ['Mitocôndria', 'Ribossomo', 'Lisossomo', 'Vacúolo'], correta: 0 },
            { pergunta: 'Células sem núcleo delimitado por membrana são chamadas de:', respostas: ['Eucariontes', 'Procariontes', 'Autótrofas', 'Heterótrofas'], correta: 1 },
            { pergunta: 'Onde ficam guardadas as informações genéticas da célula eucarionte?', respostas: ['No citoplasma', 'Na membrana', 'No núcleo', 'No complexo golgiense'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'Qual estrutura produz proteínas na célula?', alternativas: ['Ribossomo', 'Lisossomo', 'Vacúolo'], correta: 0 },
            { pergunta: 'Qual organela faz a digestão intracelular?', alternativas: ['Mitocôndria', 'Lisossomo', 'Ribossomo'], correta: 1 },
            { pergunta: 'As bactérias possuem células:', alternativas: ['Eucariontes', 'Vegetais', 'Procariontes'], correta: 2 },
            { pergunta: 'A célula é considerada:', alternativas: ['A unidade básica dos seres vivos', 'Um tipo de tecido', 'Um órgão simples'], correta: 0 }
        ]
    },
    {
        tema: 'Genética',
        palavras: ['genetica', 'gene', 'genes', 'dna', 'hereditariedade', 'mendel', 'ervilha', 'ervilhas', 'cromossomo', 'alelo', 'dominante', 'recessivo'],
        titulo: '🧬 DNA, genes e hereditariedade',
        secoes: [
            {
                subtitulo: 'O material genético',
                texto: 'O DNA é a molécula que guarda as informações genéticas. Ele é formado por nucleotídeos com as bases adenina, timina, citosina e guanina. Os genes são trechos do DNA que participam da determinação das características dos organismos, como cor dos olhos e tipo sanguíneo.'
            },
            {
                subtitulo: 'As leis de Mendel',
                texto: 'Gregor Mendel cruzou ervilhas e percebeu padrões na transmissão das características. Na primeira lei, cada característica é determinada por um par de fatores (alelos) que se separam na formação dos gametas. Alelos podem ser dominantes ou recessivos, o que explica por que uma característica pode "desaparecer" em uma geração e reaparecer na seguinte.'
            }
        ],
        quiz: [
            { pergunta: 'Qual molécula armazena a informação genética?', respostas: ['Glicose', 'DNA', 'Lipídio', 'Água'], correta: 1 },
            { pergunta: 'Quem estabeleceu as leis clássicas da hereditariedade?', respostas: ['Gregor Mendel', 'Charles Darwin', 'Louis Pasteur', 'Robert Hooke'], correta: 0 },
            { pergunta: 'Genes são:', respostas: ['Tipos de célula', 'Trechos do DNA', 'Organelas', 'Proteínas do sangue'], correta: 1 }
        ],
        exercicios: [
            { pergunta: 'Qual base nitrogenada NÃO faz parte do DNA?', alternativas: ['Timina', 'Uracila', 'Guanina'], correta: 1 },
            { pergunta: 'Um alelo que se manifesta mesmo em dose única é:', alternativas: ['Dominante', 'Recessivo', 'Neutro'], correta: 0 },
            { pergunta: 'Mendel realizou seus experimentos com:', alternativas: ['Moscas', 'Ervilhas', 'Ratos'], correta: 1 },
            { pergunta: 'A transmissão de características dos pais para os filhos é a:', alternativas: ['Fotossíntese', 'Hereditariedade', 'Mutação'], correta: 1 }
        ]
    },
    {
        tema: 'Ecologia',
        palavras: ['ecologia', 'ambiente', 'ecossistema', 'cadeia alimentar', 'populacao', 'comunidade', 'produtor', 'produtores', 'consumidor', 'decompositor', 'biosfera', 'trofico'],
        titulo: '🌱 Seres vivos e ambiente',
        secoes: [
            {
                subtitulo: 'Níveis de organização',
                texto: 'Indivíduos da mesma espécie formam populações; populações diferentes que vivem no mesmo local formam uma comunidade. A comunidade junto com os fatores não vivos (água, luz, solo) forma o ecossistema. O conjunto de todos os ecossistemas do planeta é a biosfera.'
            },
            {
                subtitulo: 'Cadeias e teias alimentares',
                texto: 'Os produtores fazem fotossíntese e iniciam a cadeia alimentar. Os consumidores primários se alimentam dos produtores, e os secundários dos primários. Os decompositores devolvem nutrientes ao ambiente. A cada nível trófico há perda de energia, por isso as cadeias têm poucos níveis.'
            }
        ],
        quiz: [
            { pergunta: 'Quem inicia a cadeia alimentar?', respostas: ['Consumidores', 'Produtores', 'Decompositores', 'Predadores'], correta: 1 },
            { pergunta: 'Conjunto de populações que vivem no mesmo local:', respostas: ['Comunidade', 'Espécie', 'Bioma', 'Nicho'], correta: 0 },
            { pergunta: 'Quem recicla a matéria orgânica no ambiente?', respostas: ['Herbívoros', 'Produtores', 'Decompositores', 'Carnívoros'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'As plantas, na cadeia alimentar, são:', alternativas: ['Produtoras', 'Consumidoras', 'Decompositoras'], correta: 0 },
            { pergunta: 'Ecossistema é formado por:', alternativas: ['Só seres vivos', 'Seres vivos e ambiente físico', 'Só o solo'], correta: 1 },
            { pergunta: 'A energia, ao longo da cadeia alimentar:', alternativas: ['Aumenta', 'Fica igual', 'Diminui'], correta: 2 },
            { pergunta: 'Um animal que come apenas plantas é consumidor:', alternativas: ['Primário', 'Secundário', 'Terciário'], correta: 0 }
        ]
    },
    {
        tema: 'Evolução',
        palavras: ['evolucao', 'darwin', 'selecao natural', 'mutacao', 'adaptacao', 'especie', 'especies', 'variabilidade'],
        titulo: '🦎 Evolução e seleção natural',
        secoes: [
            {
                subtitulo: 'Como as espécies mudam',
                texto: 'A evolução é a mudança das características das populações ao longo das gerações. As mutações e a recombinação genética criam variabilidade; o ambiente favorece alguns desses indivíduos. Assim, a frequência das características muda com o tempo.'
            },
            {
                subtitulo: 'Seleção natural',
                texto: 'Charles Darwin propôs que indivíduos com características vantajosas em determinado ambiente sobrevivem e deixam mais descendentes. Não é o indivíduo que se adapta durante a vida: a população muda porque os mais aptos deixam mais filhos, transmitindo suas características.'
            }
        ],
        quiz: [
            { pergunta: 'Quem propôs a teoria da seleção natural?', respostas: ['Mendel', 'Darwin', 'Lamarck', 'Pasteur'], correta: 1 },
            { pergunta: 'A principal fonte de variabilidade genética é:', respostas: ['Mutação', 'Fotossíntese', 'Digestão', 'Osmose'], correta: 0 },
            { pergunta: 'A evolução acontece com:', respostas: ['Um indivíduo', 'Uma célula', 'Populações ao longo das gerações', 'Um órgão'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'Indivíduos mais aptos a um ambiente tendem a:', alternativas: ['Deixar mais descendentes', 'Viver menos', 'Não se reproduzir'], correta: 0 },
            { pergunta: 'Seleção natural atua sobre:', alternativas: ['Variações existentes', 'Escolhas do animal', 'Apenas plantas'], correta: 0 },
            { pergunta: 'Mutações são:', alternativas: ['Alterações no material genético', 'Doenças do sangue', 'Tipos de tecido'], correta: 0 },
            { pergunta: 'A diversidade dos seres vivos é resultado de:', alternativas: ['Processos evolutivos', 'Fotossíntese', 'Digestão'], correta: 0 }
        ]
    },
    {
        tema: 'Fisiologia Humana',
        palavras: ['fisiologia', 'digestorio', 'digestao', 'respiratorio', 'respiracao', 'circulatorio', 'sangue', 'coracao', 'nervoso', 'sistema', 'alveolo', 'intestino', 'neuronio'],
        titulo: '🫀 Sistemas do corpo humano',
        secoes: [
            {
                subtitulo: 'Digestão e respiração',
                texto: 'O sistema digestório quebra os alimentos em moléculas pequenas que podem ser absorvidas no intestino delgado. O sistema respiratório leva o ar aos alvéolos pulmonares, onde o oxigênio entra no sangue e o gás carbônico é eliminado.'
            },
            {
                subtitulo: 'Circulação e controle nervoso',
                texto: 'O coração bombeia o sangue, que transporta oxigênio, nutrientes e hormônios. O sistema nervoso recebe estímulos pelos órgãos dos sentidos, processa a informação no encéfalo e envia respostas aos músculos e glândulas.'
            }
        ],
        quiz: [
            { pergunta: 'Onde ocorrem as trocas gasosas nos pulmões?', respostas: ['Traqueia', 'Alvéolos', 'Brônquios', 'Laringe'], correta: 1 },
            { pergunta: 'Qual sistema transporta oxigênio e nutrientes?', respostas: ['Circulatório', 'Digestório', 'Excretor', 'Esquelético'], correta: 0 },
            { pergunta: 'A maior parte da absorção de nutrientes acontece no:', respostas: ['Estômago', 'Esôfago', 'Intestino delgado', 'Fígado'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'O órgão que bombeia o sangue é o:', alternativas: ['Coração', 'Pulmão', 'Rim'], correta: 0 },
            { pergunta: 'O sistema nervoso é responsável por:', alternativas: ['Coordenar funções e respostas', 'Digerir alimentos', 'Filtrar o ar'], correta: 0 },
            { pergunta: 'O gás eliminado na respiração é o:', alternativas: ['Oxigênio', 'Gás carbônico', 'Nitrogênio'], correta: 1 },
            { pergunta: 'A digestão começa na:', alternativas: ['Boca', 'Traqueia', 'Bexiga'], correta: 0 }
        ]
    },
    {
        tema: 'Botânica',
        palavras: ['botanica', 'planta', 'plantas', 'fotossintese', 'raiz', 'raizes', 'caule', 'folha', 'flor', 'fruto', 'semente', 'clorofila', 'cloroplasto', 'seiva'],
        titulo: '🌿 Plantas e fotossíntese',
        secoes: [
            {
                subtitulo: 'Fotossíntese',
                texto: 'Na fotossíntese, a planta usa a energia da luz, água e gás carbônico para produzir glicose e liberar oxigênio. O processo acontece nos cloroplastos, organelas que contêm clorofila, o pigmento verde que capta a luz.'
            },
            {
                subtitulo: 'Estruturas vegetais',
                texto: 'A raiz fixa a planta e absorve água e sais minerais. O caule sustenta e conduz a seiva. As folhas realizam a fotossíntese e a transpiração. A flor é a estrutura reprodutiva das plantas com flores, que dá origem ao fruto e às sementes.'
            }
        ],
        quiz: [
            { pergunta: 'Em qual organela ocorre a fotossíntese?', respostas: ['Mitocôndria', 'Cloroplasto', 'Ribossomo', 'Núcleo'], correta: 1 },
            { pergunta: 'Qual gás é liberado na fotossíntese?', respostas: ['Oxigênio', 'Gás carbônico', 'Nitrogênio', 'Hidrogênio'], correta: 0 },
            { pergunta: 'Qual estrutura absorve água e sais minerais?', respostas: ['Folha', 'Flor', 'Raiz', 'Fruto'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'O pigmento verde que capta a luz é a:', alternativas: ['Clorofila', 'Hemoglobina', 'Melanina'], correta: 0 },
            { pergunta: 'A fotossíntese produz principalmente:', alternativas: ['Glicose', 'Proteína', 'Gordura'], correta: 0 },
            { pergunta: 'A condução da seiva ocorre no:', alternativas: ['Caule', 'Fruto', 'Pólen'], correta: 0 },
            { pergunta: 'A estrutura reprodutiva das angiospermas é a:', alternativas: ['Raiz', 'Flor', 'Folha'], correta: 1 }
        ]
    },
    {
        tema: 'Microbiologia',
        palavras: ['virus', 'bacteria', 'bacterias', 'fungo', 'fungos', 'microbiologia', 'antibiotico', 'dengue', 'gripe', 'covid', 'micro-organismo'],
        titulo: '🦠 Vírus, bactérias e fungos',
        secoes: [
            {
                subtitulo: 'Vírus',
                texto: 'Vírus são parasitas intracelulares obrigatórios formados por material genético e uma cápsula de proteínas. Não possuem células nem metabolismo próprio, por isso só se multiplicam dentro de células hospedeiras. Gripe, dengue e covid-19 são doenças virais.'
            },
            {
                subtitulo: 'Bactérias e fungos',
                texto: 'Bactérias são seres unicelulares procariontes. Muitas são úteis: produzem iogurte, decompõem matéria orgânica e vivem no nosso intestino. Fungos são eucariontes heterótrofos que se alimentam por absorção e atuam como decompositores; alguns são usados na fabricação de pães e antibióticos.'
            }
        ],
        quiz: [
            { pergunta: 'Vírus só se multiplicam:', respostas: ['No solo', 'Dentro de células hospedeiras', 'Na água salgada', 'No ar'], correta: 1 },
            { pergunta: 'Bactérias são organismos:', respostas: ['Procariontes', 'Eucariontes', 'Multicelulares', 'Autótrofos sempre'], correta: 0 },
            { pergunta: 'Os fungos se alimentam por:', respostas: ['Fotossíntese', 'Fagocitose', 'Absorção', 'Quimiossíntese'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'A dengue é causada por:', alternativas: ['Vírus', 'Bactéria', 'Fungo'], correta: 0 },
            { pergunta: 'Antibióticos agem contra:', alternativas: ['Bactérias', 'Vírus', 'Insetos'], correta: 0 },
            { pergunta: 'Fungos e bactérias decompositores atuam:', alternativas: ['Reciclando nutrientes', 'Produzindo luz', 'Fazendo fotossíntese'], correta: 0 },
            { pergunta: 'Vírus possuem:', alternativas: ['Material genético e proteínas', 'Núcleo e mitocôndrias', 'Parede celular de celulose'], correta: 0 }
        ]
    },
    {
        tema: 'Bioquímica',
        palavras: ['bioquimica', 'agua', 'sais minerais', 'carboidrato', 'lipidio', 'proteina', 'proteinas', 'enzima', 'enzimas', 'aminoacido', 'glicose', 'vitamina'],
        titulo: '⚗️ Biomoléculas e água',
        secoes: [
            {
                subtitulo: 'Água e sais minerais',
                texto: 'A água é a substância mais abundante nos seres vivos. Ela participa das reações químicas, transporta substâncias e ajuda a regular a temperatura corporal. Sais minerais como cálcio, ferro e iodo atuam na formação de estruturas e no funcionamento do organismo.'
            },
            {
                subtitulo: 'Carboidratos, lipídios e proteínas',
                texto: 'Carboidratos são a principal fonte de energia rápida. Lipídios armazenam energia, formam membranas e isolam termicamente. Proteínas são formadas por aminoácidos e desempenham funções estruturais, de defesa e enzimática. As enzimas aceleram reações químicas.'
            }
        ],
        quiz: [
            { pergunta: 'Qual biomolécula é a principal fonte de energia rápida?', respostas: ['Carboidrato', 'Lipídio', 'Proteína', 'Vitamina'], correta: 0 },
            { pergunta: 'As proteínas são formadas por:', respostas: ['Ácidos graxos', 'Aminoácidos', 'Glicose', 'Nucleotídeos'], correta: 1 },
            { pergunta: 'A função das enzimas é:', respostas: ['Armazenar energia', 'Transportar gases', 'Acelerar reações químicas', 'Formar o DNA'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'A substância mais abundante nas células é a:', alternativas: ['Água', 'Glicose', 'Gordura'], correta: 0 },
            { pergunta: 'O ferro é importante para:', alternativas: ['O transporte de oxigênio no sangue', 'A fotossíntese', 'A digestão de gorduras'], correta: 0 },
            { pergunta: 'Os lipídios têm como função:', alternativas: ['Reserva de energia', 'Duplicar o DNA', 'Produzir urina'], correta: 0 },
            { pergunta: 'Enzimas são, quimicamente:', alternativas: ['Proteínas', 'Carboidratos', 'Sais minerais'], correta: 0 }
        ]
    },
    {
        tema: 'Histologia',
        palavras: ['histologia', 'tecido', 'tecidos', 'epitelial', 'conjuntivo', 'muscular', 'cartilagem', 'osso', 'neuronio'],
        titulo: '🧫 Tecidos do corpo humano',
        secoes: [
            {
                subtitulo: 'Tipos de tecido',
                texto: 'Tecido é um conjunto de células semelhantes que realizam a mesma função. No corpo humano existem quatro tipos básicos: epitelial, conjuntivo, muscular e nervoso.'
            },
            {
                subtitulo: 'Funções principais',
                texto: 'O tecido epitelial reveste superfícies e forma glândulas. O conjuntivo preenche espaços e sustenta; ossos, cartilagem e sangue são variedades dele. O muscular se contrai e produz movimento. O nervoso conduz impulsos nervosos por meio dos neurônios.'
            }
        ],
        quiz: [
            { pergunta: 'Qual tecido reveste as superfícies do corpo?', respostas: ['Epitelial', 'Muscular', 'Nervoso', 'Ósseo'], correta: 0 },
            { pergunta: 'O sangue é um tipo de tecido:', respostas: ['Epitelial', 'Conjuntivo', 'Muscular', 'Nervoso'], correta: 1 },
            { pergunta: 'A célula do tecido nervoso é o:', respostas: ['Osteócito', 'Miócito', 'Neurônio', 'Adipócito'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'A contração e o movimento são feitos pelo tecido:', alternativas: ['Muscular', 'Epitelial', 'Conjuntivo'], correta: 0 },
            { pergunta: 'Tecido é um conjunto de:', alternativas: ['Células semelhantes com a mesma função', 'Órgãos diferentes', 'Sistemas'], correta: 0 },
            { pergunta: 'A cartilagem é um tecido:', alternativas: ['Conjuntivo', 'Nervoso', 'Epitelial'], correta: 0 },
            { pergunta: 'Quantos tipos básicos de tecido existem no corpo humano?', alternativas: ['Quatro', 'Dois', 'Dez'], correta: 0 }
        ]
    },
    {
        tema: 'Reprodução e Embriologia',
        palavras: ['reproducao', 'embriologia', 'gameta', 'gametas', 'fecundacao', 'zigoto', 'embriao', 'ovulo', 'espermatozoide', 'meiose', 'mitose', 'gastrula'],
        titulo: '👶 Reprodução e desenvolvimento',
        secoes: [
            {
                subtitulo: 'Tipos de reprodução',
                texto: 'Na reprodução assexuada um único organismo origina descendentes idênticos a ele, como na divisão de bactérias. Na sexuada há união de gametas, o que gera descendentes com combinações genéticas novas e aumenta a variabilidade.'
            },
            {
                subtitulo: 'Da fecundação ao embrião',
                texto: 'Na fecundação, o espermatozoide se une ao óvulo formando o zigoto. O zigoto se divide por mitoses, passando por mórula, blástula e gástrula, quando surgem os folhetos embrionários que darão origem aos tecidos e órgãos.'
            }
        ],
        quiz: [
            { pergunta: 'A união dos gametas é chamada de:', respostas: ['Mitose', 'Fecundação', 'Meiose', 'Gastrulação'], correta: 1 },
            { pergunta: 'A célula formada na fecundação é o:', respostas: ['Zigoto', 'Óvulo', 'Espermatozoide', 'Embrião adulto'], correta: 0 },
            { pergunta: 'A reprodução sexuada tem como vantagem:', respostas: ['Descendentes idênticos', 'Menor gasto de energia', 'Maior variabilidade genética', 'Não precisar de gametas'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'Gametas são produzidos por:', alternativas: ['Meiose', 'Fotossíntese', 'Digestão'], correta: 0 },
            { pergunta: 'A divisão de bactérias é um exemplo de reprodução:', alternativas: ['Assexuada', 'Sexuada', 'Cruzada'], correta: 0 },
            { pergunta: 'A fase em que surgem os folhetos embrionários é a:', alternativas: ['Gástrula', 'Mórula', 'Zigoto'], correta: 0 },
            { pergunta: 'O gameta feminino humano é o:', alternativas: ['Óvulo', 'Espermatozoide', 'Pólen'], correta: 0 }
        ]
    },
    {
        tema: 'Imunologia e Saúde',
        palavras: ['imunologia', 'vacina', 'vacinas', 'soro', 'anticorpo', 'anticorpos', 'antigeno', 'defesa', 'globulo branco', 'imunidade', 'saude'],
        titulo: '🛡️ Defesas do corpo e vacinas',
        secoes: [
            {
                subtitulo: 'Como o corpo se defende',
                texto: 'A pele e as mucosas são barreiras que impedem a entrada de micro-organismos. Se um invasor passa, os glóbulos brancos entram em ação: alguns englobam o invasor, outros produzem anticorpos específicos que o neutralizam.'
            },
            {
                subtitulo: 'Vacinas e soros',
                texto: 'A vacina contém antígenos que estimulam o corpo a produzir seus próprios anticorpos e células de memória, gerando imunidade ativa e duradoura. O soro já contém anticorpos prontos e é usado em situações de urgência, como picadas de cobra, gerando imunidade passiva e temporária.'
            }
        ],
        quiz: [
            { pergunta: 'As vacinas fazem o corpo produzir:', respostas: ['Antígenos', 'Anticorpos', 'Hormônios', 'Enzimas digestivas'], correta: 1 },
            { pergunta: 'Qual célula do sangue atua na defesa do organismo?', respostas: ['Glóbulo branco', 'Glóbulo vermelho', 'Plaqueta', 'Neurônio'], correta: 0 },
            { pergunta: 'O soro antiofídico fornece:', respostas: ['Antígenos', 'Células de memória', 'Anticorpos prontos', 'Vitaminas'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'A primeira barreira de defesa do corpo é a:', alternativas: ['Pele', 'Medula óssea', 'Bexiga'], correta: 0 },
            { pergunta: 'A imunidade gerada pela vacina é:', alternativas: ['Ativa e duradoura', 'Passiva e imediata', 'Inexistente'], correta: 0 },
            { pergunta: 'Anticorpos são produzidos contra:', alternativas: ['Antígenos específicos', 'Qualquer alimento', 'Sais minerais'], correta: 0 },
            { pergunta: 'Em caso de picada de cobra usa-se:', alternativas: ['Soro', 'Vacina', 'Antibiótico apenas'], correta: 0 }
        ]
    },
    {
        tema: 'Biotecnologia',
        palavras: ['biotecnologia', 'transgenico', 'transgenicos', 'clonagem', 'clone', 'dolly', 'insulina', 'fermentacao', 'teste de dna', 'paternidade'],
        titulo: '🧪 Biotecnologia e DNA na prática',
        secoes: [
            {
                subtitulo: 'Aplicações da biotecnologia',
                texto: 'Biotecnologia é o uso de seres vivos ou de suas partes para produzir bens e serviços. Exemplos: produção de insulina por bactérias modificadas, fermentação para fazer pães e queijos, e cultivo de plantas transgênicas resistentes a pragas.'
            },
            {
                subtitulo: 'Testes de DNA e clonagem',
                texto: 'O exame de DNA compara sequências e é usado em testes de paternidade e investigações criminais. Na clonagem, produz-se um organismo geneticamente idêntico a outro, como aconteceu com a ovelha Dolly. Essas técnicas envolvem debates éticos importantes.'
            }
        ],
        quiz: [
            { pergunta: 'Organismos com genes de outra espécie inseridos são:', respostas: ['Transgênicos', 'Clones', 'Híbridos naturais', 'Mutantes espontâneos'], correta: 0 },
            { pergunta: 'A insulina usada por pessoas com diabetes pode ser produzida por:', respostas: ['Vírus', 'Bactérias modificadas', 'Fungos venenosos', 'Algas tóxicas'], correta: 1 },
            { pergunta: 'A ovelha Dolly ficou famosa por ser resultado de:', respostas: ['Transgenia', 'Vacinação', 'Clonagem', 'Fermentação'], correta: 2 }
        ],
        exercicios: [
            { pergunta: 'O teste de paternidade compara:', alternativas: ['Sequências de DNA', 'Tipos de tecido', 'Batimentos cardíacos'], correta: 0 },
            { pergunta: 'A fermentação é usada na produção de:', alternativas: ['Pães e queijos', 'Plástico', 'Vidro'], correta: 0 },
            { pergunta: 'Um clone é geneticamente:', alternativas: ['Idêntico ao original', 'Muito diferente', 'Sempre estéril'], correta: 0 },
            { pergunta: 'Biotecnologia significa usar seres vivos para:', alternativas: ['Produzir bens e serviços', 'Eliminar o DNA', 'Impedir a evolução'], correta: 0 }
        ]
    }
];

module.exports = { TEMAS };
