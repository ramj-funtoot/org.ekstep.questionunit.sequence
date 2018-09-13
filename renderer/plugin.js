/**
 *
 * Question Unit plugin to render a SEQ question
 * @class org.ekstep.questionunit.sequence
 * @extends org.ekstep.contentrenderer.questionUnitPlugin
 * @author Sivashanmugam Kannan <sivashanmugam.kannan@funtoot.com>
 */
org.ekstep.questionunitseq = {};
org.ekstep.questionunitseq.RendererPlugin = org.ekstep.contentrenderer.questionUnitPlugin.extend({
  _type: 'org.ekstep.questionunit.sequence',
  _isContainer: true,
  _render: true,
  _selectedAnswers: [],
  _dragulaContainers: [],
  _constant: {
    horizontal: "Horizontal",
    vertial : "Vertical"
  },
  setQuestionTemplate: function () {
    SEQController.initTemplate(this);// eslint-disable-line no-undef
  },

  preQuestionShow: function (event) {
    this._super(event);
    this._question.template = SEQController.getQuestionTemplate(this._question.config.layout, this._constant);
    _.each(this._question.data.options, function(option,index){
      option.sequenceOrder = index + 1;
    })
    this._question.data.options = _.shuffle(this._question.data.options);
  },
  postQuestionShow: function (event) {
    var instance = this;
  },
  evaluateQuestion: function(event){
    var instance = this;
    var callback = event.target;
    var correctAnswer = true;
    var correctAnswersCount = 0;
    var telemetryValues = [];
    var totalOptions = instance._question.data.options.length;
    $('.option-block').each(function(actualSeqMapIndex, elem){
      var telObj = {
        'SEQ':[]
      };
      var selectedSeqOrder = parseInt($(elem).data('seqorder')) - 1;
      telObj['SEQ'][actualSeqMapIndex] = instance._question.data.options[actualSeqMapIndex];
      telemetryValues.push(telObj);
      if(selectedSeqOrder == actualSeqMapIndex){
        correctAnswersCount++;
      } else {
        correctAnswer = false;
      }
    })
    var partialScore;
    if(this._question.config.partial_scoring){
      partialScore = (correctAnswersCount / totalOptions) * this._question.config.max_score;
    }else{
      partialScore = 0;
    }
    var result = {
      eval: correctAnswer,
      state: {
        val: {
          "sequence": this._question.data.options
        }
      },
      score: partialScore,
      values: telemetryValues,
      noOfCorrectAns: correctAnswersCount,
      totalAns: totalOptions
    };
    if (_.isFunction(callback)) {
      callback(result);
    }
    EkstepRendererAPI.dispatchEvent('org.ekstep.questionset:saveQuestionState', result.state);
  },
  logTelemetryItemResponse: function (data) {
    QSTelemetryLogger.logEvent(QSTelemetryLogger.EVENT_TYPES.RESPONSE, {"type": "INPUT", "values": data});
  }
});
//# sourceURL=questionunit.sequence.renderer.plugin.js