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

	normalise(events) {
		console.log(events)
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
		console.log('rip constructor')
	}

	_onIC(event) {
		for (let i = 0; i < this._trickWindows.length; i++) {
			//console.log(this._trickWindows[i]\event.timestamp)
			if (this._trickWindows[i] < event.timestamp && event.timestamp < this._trickWindows[i]+10000) {
				this._numIC++
			}
		}
	}

	_onUpheaval(event) {
		for (let i = 0; i < this._trickWindows.length; i++) {
			//console.log(this._trickWindows[i]\event.timestamp)
			if (this._trickWindows[i] < event.timestamp && event.timestamp < this._trickWindows[i]+10000) {
				this._numUpheaval++
			}
		}
	}

	_onFC(event) {
		for (let i = 0; i < this._trickWindows.length; i++) {
			//console.log(this._trickWindows[i]\event.timestamp)
			if (this._trickWindows[i] < event.timestamp && event.timestamp < this._trickWindows[i]+10000) {
				this._numFC++
			}
		}
	}

	_onComplete() {
		if (this._trickWindows !== []) {
			if (this._numIC < this._trickWindows.length * 2) {
				console.log('running if')
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
			if (this._numFC < this._trickWindows.length) {
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
			if (this._numUpheaval < this._trickWindows.length) {
				this.suggestions.add(new Suggestion({
					icon: ACTIONS.UPHEAVAL.icon,
					content: <Trans id="war.TA-window.suggestions.upheaval.content">
					Try to get an <ActionLink {...ACTIONS.UPHEAVAL}/> inside each Trick window
					</Trans>,
					severity: SEVERITY.MINOR,
					why: <Trans id="war.TA-window.suggestions.upheaval.why">
						{this._numUpheaval} Upheavals were in TA, there were {this._trickWindows.length} tricks.
					</Trans>,
				}))
			}
		}
	}

}
