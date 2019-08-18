import React from 'react'
import ACTIONS from 'data/ACTIONS'
import Module from 'parser/core/Module'
import {TieredSuggestion, SEVERITY} from 'parser/core/modules/Suggestions'
import {Trans} from '@lingui/react'
import {ActionLink} from 'components/ui/DbLink'

const WASTED_USE_TIERS = {
	3: SEVERITY.MINOR,
	10: SEVERITY.MEDIUM,
	20: SEVERITY.MAJOR, //if not used at all, it'll be set to 100 for severity checking
}

export default class Upheaval extends Module {
	static handle = 'upheaval'
	static dependencies = [
		'suggestions',
	]

	_lastUse = 0
	_uses = 0
	_totalDrift = 0
	_usesMissed = 0

	constructor(...args) {
		super(...args)
		const _filter = {
			by: 'player',
			abilityId: [ACTIONS.UPHEAVAL.id],
		}
		this.addHook('cast', _filter, this._onCast)
		this.addHook('complete', this._onComplete)
	}

	_onCast(event) {
		this._uses++
		if (this._lastUse === 0) { this._lastUse = this.parser.fight.start_time }
		const timeHeld = ((event.timestamp - this._lastUse)/1000)
		const drift = (this._lastUse === this.parser.fight.start_time) ? 0 : parseInt(timeHeld-ACTIONS.UPHEAVAL.cooldown)
		this._totalDrift += drift
		//update the last use
		this._lastUse = event.timestamp
	}

	_onComplete() {
		this._usesMissed = parseInt(this._totalDrift/ACTIONS.UPHEAVAL.cooldown)
		//const _usesMissed = Math.floor(holdDuration / (ACTIONS.DIVINE_BENISON.cooldown * 1000))
		if (this._totalDrift > ACTIONS.UPHEAVAL.cooldown) {
			this.suggestions.add(new TieredSuggestion({
				icon: ACTIONS.UPHEAVAL.icon,
				content: <Trans id="war.upheaval.suggestion.content">
						Use <ActionLink {...ACTIONS.UPHEAVAL} /> on cooldown. Drifting will require one upheaval to be skipped or upheaval not being up for <ActionLink {...ACTIONS.INNER_RELEASE}/>.
				</Trans>,
				tiers: WASTED_USE_TIERS,
				value: 20,
				why: <Trans id="war.upheaval.suggestion.why">
					About {this._usesMissed} use(s) of <ActionLink {...ACTIONS.UPHEAVAL} /> were lost by holding it for at least a total of {this._totalDrift} seconds.
				</Trans>,
			}))
		}
	}
}
