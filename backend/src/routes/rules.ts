import { FastifyInstance } from 'fastify';
import { RulesEngine } from '../services/RulesEngine.js';
import { CustomContentManager } from '../services/CustomContentManager.js';

export async function rulesRoutes(fastify: FastifyInstance) {
  const customContentManager = new CustomContentManager();
  let rulesEngine: RulesEngine;

  // Initialize rules engine on first request
  const initializeRulesEngine = async () => {
    if (!rulesEngine) {
      rulesEngine = new RulesEngine();
      await rulesEngine.loadCoreRules();
    }
    return rulesEngine;
  };

  // Get all races
  fastify.get('/races', async (request, reply) => {
    try {
      const engine = await initializeRulesEngine();
      const customContent = await customContentManager.loadCustomContent();
      const mergedEngine = new RulesEngine(customContent);
      await mergedEngine.loadCoreRules();
      const races = mergedEngine.getAllRaces();
      reply.send({ success: true, data: races });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Get all classes
  fastify.get('/classes', async (request, reply) => {
    try {
      const engine = await initializeRulesEngine();
      const customContent = await customContentManager.loadCustomContent();
      const mergedEngine = new RulesEngine(customContent);
      await mergedEngine.loadCoreRules();
      const classes = mergedEngine.getAllClasses();
      reply.send({ success: true, data: classes });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Get core rules summary
  fastify.get('/core', async (request, reply) => {
    try {
      const engine = await initializeRulesEngine();
      const coreRules = engine.getCoreRules();
      reply.send({ success: true, data: coreRules });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Get merged rules (core + custom)
  fastify.get('/merged', async (request, reply) => {
    try {
      const engine = await initializeRulesEngine();
      const customContent = await customContentManager.loadCustomContent();
      const mergedEngine = new RulesEngine(customContent);
      await mergedEngine.loadCoreRules();
      const mergedRules = mergedEngine.getMergedRules();
      reply.send({ success: true, data: mergedRules });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Get specific race
  fastify.get('/races/:name', async (request: any, reply) => {
    try {
      const engine = await initializeRulesEngine();
      const customContent = await customContentManager.loadCustomContent();
      const mergedEngine = new RulesEngine(customContent);
      await mergedEngine.loadCoreRules();
      const race = mergedEngine.getRace(request.params.name);
      if (!race) return reply.status(404).send({ success: false, error: 'Race not found' });
      reply.send({ success: true, data: race });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });

  // Get specific class
  fastify.get('/classes/:name', async (request: any, reply) => {
    try {
      const engine = await initializeRulesEngine();
      const customContent = await customContentManager.loadCustomContent();
      const mergedEngine = new RulesEngine(customContent);
      await mergedEngine.loadCoreRules();
      const characterClass = mergedEngine.getClass(request.params.name);
      if (!characterClass) return reply.status(404).send({ success: false, error: 'Class not found' });
      reply.send({ success: true, data: characterClass });
    } catch (error: any) {
      reply.status(500).send({ success: false, error: error.message });
    }
  });
}

export default rulesRoutes;
