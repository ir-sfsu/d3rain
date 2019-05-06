HTMLWidgets.widget({

  name: 'd3rain',

  type: 'output',

  factory: function(el, width, height) {

    return {

      renderValue: function(opts) {

        margin = ({top: 100, right: 10, bottom: 20, left: 25});

        const data = HTMLWidgets.dataframeToD3(opts.data);
        //console.log(data);

        const svg = d3.select(el)
                    .append("svg")
                    .style("width", "100%")
                    .style("height", "100%");

        svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", opts.hasOwnProperty('backgroundFill') ? opts.backgroundFill : 'white');


        let fontSize = opts.hasOwnProperty('fontSize') ? opts.fontSize : 18;
        let fontFamily = opts.hasOwnProperty('fontFamily') ? opts.fontFamily : 'sans-serif';
        let jitterWidth = opts.hasOwnProperty('jitterWidth') ? opts.jitterWidth : 0;
        let dropSequence = opts.hasOwnProperty('dropSequence') ? opts.dropSequence : 'iterate';

        function ease(o) {
            return o === 'bounce' ? d3.easeBounce : d3.easeLinear;
        }

        let x;
        if (opts.reverseX) {
          x = d3.scaleLinear()
                .domain([d3.max(data, d => +d.ind), 0])
                .range([margin.left, width - margin.right]);
        } else {
          x = d3.scaleLinear()
                .domain([0, d3.max(data, d => +d.ind)])
                .range([margin.left, width - margin.right]);
        }

        let xAxis = g => g
                .style("font", `${opts.fontSize}px ${opts.fontFamily}`)
                .call(d3.axisTop(x)
                    .tickPadding(15)
                    .tickValues(d3.extent(data, d => +d.ind))
                    .tickSize(0))
                .call(g => g.select(".domain").remove());

        let y = d3.scaleBand()
                .domain(opts.y_domain)
                .range([margin.top, height - margin.bottom]);

        let yAxis = g => g
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(y))
                .call(g => g.selectAll(".tick line").clone()
                  .attr("stroke-opacity", 0.2)
                  .attr("x2", width - margin.right))
                  .attr('transform', 'translate(0, 10)')
                .call(g => g.select(".domain").remove());

        svg.append("g")
              .attr('transform', `translate(0, ${margin.top/2 + 5})`)
              .call(xAxis);

        svg.append("g")
                .call(yAxis)
                .selectAll("text")
                .attr("x", width / 2)
                .attr('transform', 'translate(0, 10)')
                .style("font", `${opts.fontSize}px ${opts.fontFamily}`);

        svg.append("text")
                .attr("x", (width / 2))
                .attr("y", margin.top / 6)
                .attr("text-anchor", "middle")
                .style("font-family", `${fontFamily}`)
                .style("font-size", "20px")
                .style("font-weight", "bold")
                .text(opts.title);


        let tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([7, 7])
              .html(function(d) {
                return `<span>${d.toolTip}</span>`;
              });

        svg.call(tip);

        let circles = svg.selectAll('circle')
            .data(data)
              .enter().append('circle')
                .attr('cx', d => x(d.ind))
                .attr('cy', margin.top / 2)
                .attr('r', 5)
                .attr('fill', opts.hasOwnProperty('dropFill') ? opts.dropFill : 'firebrick')
                .style('opacity', opts.hasOwnProperty('dropOpacity') ? opts.dropOpacity : 0.5)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);


        if (dropSequence === 'iterate') {
          d3.timeout(_ => {
            circles = circles.transition()
            .delay((d, i) => opts.hasOwnProperty('iterationSpeedX') ? opts.iterationSpeedX * i : 100 * i)
            .duration(opts.hasOwnProperty('dropSpeed') ? opts.dropSpeed : 1000)
            .ease(opts.hasOwnProperty('ease') ? ease(opts.ease) : d3.easeBounce)
            .attr('cy', d => y(d.group) + y.bandwidth() / 2 - Math.random() * jitterWidth);
            }, 1500);
        } else {
          d3.timeout(_ => {
            circles = circles.transition()
            .duration(opts.hasOwnProperty('dropSpeed') ? opts.dropSpeed : 1000)
            .ease(opts.hasOwnProperty('ease') ? ease(opts.ease) : d3.easeBounce)
            .attr('cy', d => y(d.group) + y.bandwidth() / 2 - Math.random() * jitterWidth);
          }, 1500);
        }
      },

      resize: function(width, height) {

        // TODO: code to re-render the widget with a new size

      }

    };
  }
});
