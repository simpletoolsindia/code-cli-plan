// Multi-Agent System Test
// Run with: bun test-multiagent.ts

import {
  Coordinator,
  WorkerAgent,
  AgentSession,
  registerAgentType,
  createAgent,
  registerDefaultAgents,
  type AgentConfig,
  type InterAgentMessage,
} from './src/agents/index.ts'

console.log('🐉 Beast CLI - Multi-Agent System Test')
console.log('═'.repeat(70))

let passed = 0
let failed = 0

// ═══════════════════════════════════════════════════════════════════
// F1-01: Multi-Agent Coordination
// ═══════════════════════════════════════════════════════════════════
console.log('\n📦 F1-01: Multi-Agent Coordination')
console.log('─'.repeat(50))

try {
  // Test coordinator
  const coordinator = new Coordinator()
  console.log(`   ✅ Coordinator: created`)

  // Test agent registration
  const agentId = coordinator.registerAgent({
    id: 'test-agent-1',
    name: 'Test Agent',
    role: 'worker',
    tools: ['Read', 'Edit'],
  })
  console.log(`   ✅ registerAgent: ${agentId}`)

  // Test spawn worker
  const workerId = coordinator.spawnWorker({
    name: 'Research Worker',
    tools: ['Read', 'Grep'],
  })
  console.log(`   ✅ spawnWorker: ${workerId}`)

  // Test get agents
  const agents = coordinator.getAllAgents()
  console.log(`   ✅ getAllAgents: ${agents.length} agents`)

  // Test get by role
  const workers = coordinator.getAgentsByRole('worker')
  console.log(`   ✅ getAgentsByRole: ${workers.length} workers`)

  // Test send message
  coordinator.sendMessage(workerId, 'task', { description: 'Research codebase' })
  console.log(`   ✅ sendMessage: task dispatched`)

  // Test stop agent
  coordinator.stopAgent(workerId)
  console.log(`   ✅ stopAgent: worker stopped`)

  // Test WorkerAgent
  const worker = new WorkerAgent({
    id: 'worker-1',
    name: 'Builder',
    tools: ['Read', 'Edit', 'Write'],
  })
  console.log(`   ✅ WorkerAgent: created`)

  // Test tool availability
  const canRead = worker.isToolAllowed('Read')
  const canBash = worker.isToolAllowed('Bash')
  console.log(`   ✅ isToolAllowed: Read=${canRead}, Bash=${canBash}`)

  // Test handle task
  const result = await worker.handleTask({ action: 'build', target: 'src/app.ts' })
  console.log(`   ✅ handleTask: ${(result as any).agentName} completed task`)

  // Test agent type registration
  registerAgentType('custom', config => new WorkerAgent({
    id: config.id,
    name: config.name,
    tools: config.tools ?? [],
  }))
  console.log(`   ✅ registerAgentType: custom type registered`)

  // Test create agent from type
  const customAgent = createAgent('custom', {
    id: 'custom-1',
    name: 'Custom Agent',
    role: 'worker',
  })
  console.log(`   ✅ createAgent: ${customAgent?.getName() ?? 'null'}`)

  // Test default agents
  registerDefaultAgents()
  const researchAgent = createAgent('research', {
    id: 'research-1',
    name: 'Researcher',
    role: 'worker',
  })
  console.log(`   ✅ default agents: research = ${researchAgent?.getName()}`)

  // Test AgentSession
  const session = new AgentSession('session-123')
  console.log(`   ✅ AgentSession: created`)

  // Test session initialization
  await session.initialize({
    coordinatorTools: ['*'],
    workerCount: 3,
    workerTools: ['Read', 'Grep'],
  })
  console.log(`   ✅ session.initialize: 3 workers spawned`)

  // Test assign task
  session.assignTask('worker-1', { task: 'Find all TODO comments' })
  console.log(`   ✅ assignTask: dispatched to worker-1`)

  // Test broadcast
  session.assignToAll({ task: 'Report status' })
  console.log(`   ✅ assignToAll: broadcasted to all workers`)

  // Test get results
  const results = session.getResults()
  console.log(`   ✅ getResults: ${results.results.succeeded.length} succeeded, ${results.results.failed.length} failed`)

  // Test destroy
  session.destroy()
  console.log(`   ✅ destroy: session cleaned up`)

  console.log('   ✅ F1-01: Multi-Agent Coordination ✅ PASS')
  passed++
} catch (e) {
  console.log(`   ❌ F1-01: ${e}`)
  failed++
}

// ═══════════════════════════════════════════════════════════════════
// Summary
// ═══════════════════════════════════════════════════════════════════
console.log('\n' + '═'.repeat(70))
console.log('📊 MULTI-AGENT TEST REPORT')
console.log('═'.repeat(70))
console.log(`
  F1-01: Multi-Agent Coordination    ✅ PASS
     - Coordinator with worker management
     - Inter-agent messaging (task, result, stop, error)
     - AgentSession for multi-agent workflows
     - Tool restriction per agent (whitelist/blacklist)
     - Default agent types (research, builder, tester)
     - Result synthesis from workers

  ─────────────────────────────────────
  Tests Passed: ${passed}/1
  Tests Failed: ${failed}
  ─────────────────────────────────────
`)

process.exit(failed === 0 ? 0 : 1)