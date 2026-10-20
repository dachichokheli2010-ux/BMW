import assert from 'node:assert/strict';
import {focusLearningTarget,revealLearningFeedback} from '../public/learning-navigation.js';

function targetAt(top,bottom,{reduced=false,scrollY=1600,headerBottom=86}={}){
 const calls=[],win={scrollY,innerHeight:780,matchMedia:()=>({matches:reduced}),scrollTo:options=>calls.push(options)};
 const target={ownerDocument:{defaultView:win,querySelector:()=>({getBoundingClientRect:()=>({top:14,bottom:headerBottom,height:headerBottom-14})})},getBoundingClientRect:()=>({top,bottom}),focus:options=>calls.push({focus:options})};
 return {target,calls};
}
const below=targetAt(-850,-790);assert.equal(focusLearningTarget(below.target),true);assert.deepEqual(below.calls,[{focus:{preventScroll:true}},{top:648,behavior:'smooth'}]);
const visible=targetAt(120,180);assert.equal(focusLearningTarget(visible.target),false);assert.equal(visible.calls.length,1,'Visible questions receive focus without an unnecessary scroll');
const feedback=targetAt(700,1300);assert.equal(revealLearningFeedback(feedback.target),true);assert.deepEqual(feedback.calls,[{top:2198,behavior:'smooth'}]);
const tall=targetAt(120,1500);assert.equal(revealLearningFeedback(tall.target),false,'A long explanation with a visible opening must not drag the reader to its bottom');
const reduced=targetAt(-400,-300,{reduced:true});focusLearningTarget(reduced.target);assert.equal(reduced.calls.at(-1).behavior,'instant');
const top=targetAt(-500,-450,{scrollY:100});focusLearningTarget(top.target);assert.equal(top.calls.at(-1).top,0);
const pinned=targetAt(660,700);pinned.target.ownerDocument.querySelector=selector=>selector==='.site-header'?{getBoundingClientRect:()=>({top:14,bottom:86,height:72})}:{getBoundingClientRect:()=>({top:640,bottom:780,height:140})};
assert.equal(revealLearningFeedback(pinned.target),true,'Feedback hidden by the mobile action bar is moved above it');
assert.equal(pinned.calls.at(-1).top,2158);
assert.equal(focusLearningTarget(null),false);assert.equal(focusLearningTarget({}),false);
console.log('PASS Learning navigation: offscreen questions, visible answers, long feedback, reduced motion and header clearance.');
