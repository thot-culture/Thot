#!/usr/bin/env node
import assert from 'node:assert/strict';
import { waitForPreview } from './local-preview.cjs';
const alive={exitCode:null};
let calls=0;
await waitForPreview(alive,'http://127.0.0.1/',{timeoutMs:100,intervalMs:1,fetchImpl:async()=>{
 if(++calls===1)throw new Error('not ready');return {status:200};
}});
assert.equal(calls,2);
await assert.rejects(waitForPreview({exitCode:1},'http://127.0.0.1/'),/arrêté/);
const started=Date.now();
await assert.rejects(waitForPreview(alive,'http://127.0.0.1/',{timeoutMs:20,intervalMs:1,
 fetchImpl:async()=>{throw new Error('blocked');}}),{code:'LOCAL_PREVIEW_UNAVAILABLE'});
assert.ok(Date.now()-started<1000,'Une connexion refusée doit avoir un délai borné');
console.log('PASS : disponibilité HTTP, processus arrêté et délai maximal contrôlés (unités simulées, aucun serveur HTTP validé).');
