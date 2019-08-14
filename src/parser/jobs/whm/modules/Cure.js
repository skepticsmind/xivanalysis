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
			abilityId: [ACTIONS.Cure.id],
		}
		this.addHook('cast', _filter, this._onCureCast)
		this.addHook('complete', this._onComplete)
	}

	_onCureCast(event) {
		this._uses++
	}

	_onComplete() {
    const potencyDifference = 350 //both cure 2 and solace have 700 potency
    const mpDifference = 600
    var totalPotencyLoss
    var gcdLost
    var mpLost
    var dpsPotencyLost
    var gcdEfficiency

		if (this.uses > 0) {
      //1.55 cures = 1 cure 2 or solace
      totalPotencyLoss = 350 * _uses
      gcdEfficiency = Math.ceiling(_uses*.6);
      gcdLost = _uses - gcdEfficiency;
      //cant really gauge MP efficiency without looking at cure 2 and solace casts since one is free...
      //this is the best case in which every cure would be used instead of cure 2
      mpSaved = _uses*mpDifference
      //this is worst case where solace could be used instead of cure 1
      //yeah im hard coding it... ACTIONS.Cure.mp doesnt exist... RIP
      mpLost = _uses*450
      dpsPotencyLost = _uses*300
      //since Im not sure if i can do like

      this.suggestions.add(new Suggestion({
				icon: ACTIONS.Cure.icon,
				content: <Trans id="whm.cure.suggestion.content">
					Do not use <ActionLink {...ACTIONS.Cure} />. Frequent uses will mean more GCDs using heals and less GCDs doing damage. Using Cure 2
          and Afflautus Solace is more GCD efficient, MP efficient. Afflautus also adds some DPS in the form of blood lilys.
				</Trans>,
				why: <Trans id="whm.cure.suggestion.why">
          The same healing of {_uses} <ActionLink {...ACTIONS.Cure} /> can be done in {gcdsLost} <ActionLink {...ACTIONS.CURE_II} />'s or <ActionLink {...ACTIONS.AFFLATUS_SOLACE} />
				</Trans>,
        severity: SEVERITY.MEDIUM
			}))
    }
	}
}
