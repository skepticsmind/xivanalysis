import {Trans} from '@lingui/react'
import React from 'react'
import {ActionLink} from 'components/ui/DbLink'
import ACTIONS from 'data/ACTIONS'
import Module from 'parser/core/Module'
import {Suggestion, SEVERITY} from 'parser/core/modules/Suggestions'

export default class TrickWindow extends Module {
	static handle = 'warTaWindow'
	static dependencies = [
		'suggestions',
		'additionalEvents',
	]

	_numIC = 0
	_numUpheaval = 0
	_numFC = 0
	_trickWindows = []
	_trickInFight = true
	_trickNum = 0
	_trickDuration = 10000
	normalise(events) {
		let counter = 0
		for (const event of events) {

			// Registers buffs/debuffs statuses on the respective entity (either player or enemies)
			if (event.type === 'applydebuff') {
				if (event.ability.name === 'Vulnerability Up') {
					this._trickWindows[counter] = event.timestamp
					counter++
			 }
			 }
		 }
		return events
	}
	constructor(...args) {
		super(...args)
		this.addHook('cast', {by: 'player', abilityId: ACTIONS.INNER_CHAOS.id}, this._onIC)
		this.addHook('cast', {by: 'player', abilityId: ACTIONS.UPHEAVAL.id}, this._onUpheaval)
		this.addHook('cast', {by: 'player', abilityId: ACTIONS.FELL_CLEAVE.id}, this._onFC)
		this.addHook('complete', this._onComplete)
	}

	inTrick(event){
		while (event.timestamp > this._trickWindows[0] + this._trickDuration){
			this._trickWindows.shift()
			this._trickNum++
		}
		if(this._trickWindows.length !== 0 && event.timestamp > this._trickWindows[0] && event.timestamp > this._trickWindows[0] + 1000){
			return true
		}
		return false
	}

	_onIC(event) {
		if (this.inTrick(event)) {
			this._numIC++
		}
	}

	_onUpheaval(event) {
		if (this.inTrick(event)) {
			this._numUpheaval++
		}
	}

	_onFC(event) {
		if (this.inTrick(event)) {
			this._numFC++
		}
	}

	_onComplete() {
		if (this._trickWindows.length !== 0){
			this._trickNum++
		}
		if (this._trickInFight) {
			if (this._numIC < this._trickNum * 2) {
				this.suggestions.add(new Suggestion({
					icon: ACTIONS.INNER_CHAOS.icon,
					content: <Trans id="war.TA-window.suggestions.ic.content">
					Try to get 2 <ActionLink {...ACTIONS.INNER_CHAOS}/> inside each Trick window
					</Trans>,
					severity: SEVERITY.MINOR,
					why: <Trans id="war.TA-window.suggestions.ic.why">
						{this._numIC} ICs were in TA.
					</Trans>,
				}))
			}
			if (this._numFC < this._trickNum) {
				this.suggestions.add(new Suggestion({
					icon: ACTIONS.FELL_CLEAVE.icon,
					content: <Trans id="war.TA-window.suggestions.fc.content">
					Try to get a <ActionLink {...ACTIONS.FELL_CLEAVE}/> inside each Trick window
					</Trans>,
					severity: SEVERITY.MINOR,
					why: <Trans id="war.TA-window.suggestions.fc.why">
						{this._numFC} FCs were in TA.
					</Trans>,
				}))
			}
			if (this._numUpheaval < this._trickNum) {
				this.suggestions.add(new Suggestion({
					icon: ACTIONS.UPHEAVAL.icon,
					content: <Trans id="war.TA-window.suggestions.upheaval.content">
					Try to get an <ActionLink {...ACTIONS.UPHEAVAL}/> inside each Trick window
					</Trans>,
					severity: SEVERITY.MINOR,
					why: <Trans id="war.TA-window.suggestions.upheaval.why">
						{this._numUpheaval} Upheavals were in TA, there were {this._trickNum} tricks.
					</Trans>,
				}))
			}
		}
	}

}
