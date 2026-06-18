const goals = [
  {
    num: '01',
    title: 'Move Businesses Online',
    desc: 'We provide simple and affordable digital solutions that allow traditional businesses to establish a strong online presence.',
  },
  {
    num: '02',
    title: 'Improve Efficiency',
    desc: 'Through technology and automation we help businesses reduce manual work and reach more customers every day.',
  },
  {
    num: '03',
    title: 'Grow Faster Together',
    desc: 'We build long-term partnerships with local entrepreneurs to grow together in the modern digital economy.',
  },
];

const GoalSection = () => (
  <section className="section goal" id="goal">
    <div className="section-inner goal-grid">
      <div className="reveal-left">
        <div className="label">Our Mission</div>
        <h2 className="h2">Our <em>Goal</em></h2>
        <p className="body-lg">
          Our goal is to bring digital transformation to small businesses, local stores and
          entrepreneurs across India.
        </p>
        <div className="goal-points stagger-children">
          {goals.map((g) => (
            <div className="goal-pt" key={g.num}>
              <span className="goal-pt-num">{g.num}</span>
              <div>
                <h4>{g.title}</h4>
                <p>{g.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default GoalSection;
