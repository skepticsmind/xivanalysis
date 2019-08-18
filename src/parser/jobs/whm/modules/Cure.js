import React from 'react'

import ACTIONS from 'data/ACTIONS'
import Module from 'parser/core/Module'
import {Suggestion, SEVERITY} from 'parser/core/modules/Suggestions'
import {Trans} from '@lingui/react'
import {ActionLink} from 'components/ui/DbLink'

export default class Cure extends Module {
	static handle = 'cure'
	static dependencies = [
		'suggestions',
	]

	_uses = 0

	constructor(...args) {
		super(...args)

		const _filter = {
			by: 'player',
			abilityId: [ACTIONS.CURE.id],
		}
		this.addHook('cast', _filter, this._onCureCast)
		this.addHook('complete', this._onComplete)
	}

	_onCureCast() {
		this._uses++
		console.log('Count ++')
		//const abilityId = event.ability.guid
	}

	_onComplete() {
		//const potencyDifference = 350 //both cure 2 and solace have 700 potency
		//const mpDifference = 600
		//const totalPotencyLoss
		let  gcdLost
		//let mpSaved
		//let  mpLost
		//let  dpsPotencyLost
		let  gcdEfficiency
		//let totalPotencyLoss

		if (this._uses > 0) {
			const cureMult = .6
			//1.55 cures = 1 cure 2 or solace
			//totalPotencyLoss = 350 * this._uses
			gcdEfficiency = Math.ceil(this._uses*cureMult)
			gcdLost = this._uses - gcdEfficiency
			//cant really gauge MP efficiency without looking at cure 2 and solace casts since one is free...
			//this is the best case in which every cure would be used instead of cure 2
			//mpSaved = this._uses*mpDifference
			//this is worst case where solace could be used instead of cure 1
			//yeah im hard coding it... ACTIONS.Cure.mp doesnt exist... RIP
			//mpLost = this._uses*450
			//dpsPotencyLost = this._uses*300
			//since Im not sure if i can do like

			this.suggestions.add(new Suggestion({
				icon: ACTIONS.CURE.icon,
				content: <Trans id="whm.cure.suggestion.content">
					Do not use <ActionLink {...ACTIONS.CURE} />. Frequent uses will mean more GCDs using heals and less GCDs doing damage. Using Cure 2
          and Afflautus Solace is more GCD efficient, MP efficient. Afflautus also adds some DPS in the form of blood lilys.
				</Trans>,
				why: <Trans id="whm.cure.suggestion.why">
          The same healing of {this._uses} <ActionLink {...ACTIONS.CURE} /> can be done in {gcdLost} <ActionLink {...ACTIONS.CURE_II} />'s or <ActionLink {...ACTIONS.AFFLATUS_SOLACE} />
				</Trans>,
				severity: SEVERITY.MEDIUM,
			}))
		}
	}
}
