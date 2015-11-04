/**
   Run this on an Associated Press election results map
   to darken the color of counties where candidates have big leads.

   For example, this map:
   http://interactives.ap.org/2015/general-election-results/?STATE=KY&date=1103&SITEID=KYLOCELN

   Just paste it into the console [F12] and hit enter.
*/
require(["map/js/views/main",
	 'jquery',
	 'underscore',
	 'd3'],
	function(MainView, $, _, d3) {
	    // patchedUpdate is updateMapShapes plus some tweaks
	    // Function is almost identical to the one found here
	    // http://interactives.ap.org/2015/general-election-results/map/js/views/map-results.js
	    var patchedUpdate = function() {
		var mapView = this;
		mapView.filterCountyResults();
		var countyShapes = mapView.countyShapes.selectAll('path');
		var totalRaces = _.size(mapView.filteredCountyRace);
		countyShapes.each(function(d, shapeIndex) {
		    if (shapeIndex > totalRaces - 1) {
			return false;
		    }
		    var countyFIPS = d.properties.FIPS;
		    mapView.selectedCountyFips = countyFIPS;
		    mapView.filterCountyResults();
		    var candidates = mapView.getCandidates();

		    var allLeadingCandidates = mapView.getLeadingCandidate(candidates);
		    var leadingCandidate = _.size(allLeadingCandidates) > 0 ? allLeadingCandidates[0] : candidates.first();

		    var leadingCandidateStyle = leadingCandidate.get('styleClass');
		    var raceEdgeCase = leadingCandidate.get('raceException');
		    var exceptionStyle = (raceEdgeCase) ? ' ' + raceEdgeCase : '';

		    // Adjust opacity to show magnitude of lead
		    // Assumes ~2 candidates
		    var magnitudeStyle = "opacity: " + (1 - 2 * (-0.5 + leadingCandidate.get('votePercent'))) + ";"; /// inserted

		    if (raceEdgeCase === 'tie') {
			// mapView.addTiePattern();
			d3.select(this)
			    .attr('id', countyFIPS)
			    .attr('class', '')
			    .classed('county-shape', true)
			    .attr('fill', '#686868');
		    } else {
			d3.select(this)
			    .attr('id', countyFIPS)
			    .attr('class', leadingCandidateStyle + exceptionStyle)
			    .attr('style', magnitudeStyle) /// inserted
			    .classed('county-shape', true);
		    }
		});
	    };

	    var v = new MainView({
		success: function(view) {
		    // Remove existing map and table
		    $('#state-table').remove();
		    $$(".state-summary").every(function(x) {x.remove();})

		    // Monkey-patch update function
		    view.mapResultsViews[0].updateMapShapes=patchedUpdate;

		    // Insert our new map
		    var resultsContainer = view.render().$el;
		    resultsContainer.appendTo('#election-results');
		}
	    });
	    //console.log(v);
	});
