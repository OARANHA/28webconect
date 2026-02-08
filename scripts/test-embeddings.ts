/**
 * Script de teste para verificar funcionamento dos embeddings
 *
 * Uso: npx tsx scripts/test-embeddings.ts
 */

import {
  generateEmbedding,
  storeDocument,
  searchSimilarDocuments,
  countDocuments,
} from '../lib/embeddings';

async function testEmbeddings() {
  console.log('🧪 Testando sistema de embeddings\n');
  console.log('='.repeat(50));

  try {
    // Test 1: Verificar variáveis de ambiente
    console.log('\n1️⃣ Verificando variáveis de ambiente...');
    if (!process.env.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY não configurada');
    }
    console.log('   ✅ MISTRAL_API_KEY configurada');

    // Test 2: Gerar embedding simples
    console.log('\n2️⃣ Testando geração de embedding...');
    const testText = 'Sistema ERP para gestão empresarial';
    console.log(`   Texto: "${testText}"`);

    const embedding = await generateEmbedding(testText);
    console.log(`   ✅ Embedding gerado: ${embedding.length} dimensões`);

    if (embedding.length !== 1536) {
      throw new Error(`Dimensão incorreta: ${embedding.length} (esperado: 1536)`);
    }

    // Mostrar primeiros 5 valores
    console.log(
      `   Primeiros valores: [${embedding
        .slice(0, 5)
        .map((n) => n.toFixed(4))
        .join(', ')}, ...]`
    );

    // Test 3: Verificar conexão com banco
    console.log('\n3️⃣ Verificando conexão com banco de dados...');
    const docCount = await countDocuments();
    console.log(`   ✅ Conexão OK - ${docCount} documentos existentes`);

    // Test 4: Armazenar documento de teste
    console.log('\n4️⃣ Testando armazenamento de documento...');
    const testDoc = await storeDocument('Documento de teste para verificar funcionamento do RAG', {
      type: 'test',
      title: 'Documento Teste',
      timestamp: new Date().toISOString(),
    });
    console.log(`   ✅ Documento criado: ${testDoc.id}`);

    // Test 5: Busca semântica
    console.log('\n5️⃣ Testando busca semântica...');
    const query = 'teste RAG funcionamento';
    console.log(`   Query: "${query}"`);

    const results = await searchSimilarDocuments(query, 3);
    console.log(`   ✅ Busca retornou ${results.length} resultados`);

    results.forEach((doc, i) => {
      console.log(`   ${i + 1}. ${doc.content.substring(0, 50)}...`);
    });

    // Resumo
    console.log('\n' + '='.repeat(50));
    console.log('✅ Todos os testes passaram!');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n❌ Teste falhou:');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Executar
testEmbeddings();
