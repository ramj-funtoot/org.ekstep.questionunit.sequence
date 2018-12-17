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
    vertial: "Vertical"
  },
  setQuestionTemplate: function () {
    SEQController.initTemplate(this); // eslint-disable-line no-undef
  },

  preQuestionShow: function (event) {
    this._super(event);
    this._question.template = SEQController.getQuestionTemplate(this._question.config.layout, this._constant);
    _.each(this._question.data.options, function (option, index) {
      option.sequenceOrder = index + 1;
    })
    if (!this._question.state) {
      this._question.data.options = this.shuffleOptions(this._question.data.options);
    } else {
      //BASED on the rearranged order update in seqeuence
      var renderedOptions = this._question.state.val.seq_rendered;
      var reorderedOptionsIndexes = this._question.state.val.seq_rearranged;
      var newOrderedOptions = [];
      var optionsLength = renderedOptions.length;
      for (var i = 0; i < optionsLength; i++) {
        var seqObjIndex = _.findIndex(renderedOptions, function (seqOpt) {
          return seqOpt.sequenceOrder == reorderedOptionsIndexes[i];
        })
        newOrderedOptions[i] = renderedOptions[seqObjIndex];
      }
      this._question.data.options = newOrderedOptions;
    }

  },
  postQuestionShow: function (event) {
    var instance = this;
    QSTelemetryLogger.logEvent(QSTelemetryLogger.EVENT_TYPES.ASSESS); // eslint-disable-line no-undef
  },
  evaluateQuestion: function (event) {
    var instance = this;
    var callback = event.target;
    var correctAnswer = true;
    var correctAnswersCount = 0;
    var telemetryValues = [];
    var seq_rearranged = [];
    var totalOptions = instance._question.data.options.length;

    $('.option-block').each(function (actualSeqMapIndex, elem) {
      var telObj = {
        'SEQ': []
      };
      var selectedSeqOrder = parseInt($(elem).data('seqorder')) - 1;
      seq_rearranged[actualSeqMapIndex] = selectedSeqOrder + 1;
      telObj['SEQ'][actualSeqMapIndex] = instance._question.data.options[actualSeqMapIndex];
      telemetryValues.push(telObj);

      if (selectedSeqOrder == actualSeqMapIndex) {
        correctAnswersCount++;
      } else {
        correctAnswer = false;
      }
    })
    var questionScore;
    if (this._question.config.partial_scoring) {
      questionScore = (correctAnswersCount / totalOptions) * this._question.config.max_score;
    } else {
      if ((correctAnswersCount / totalOptions) == 1) {
        questionScore = this._question.config.max_score;
      } else {
        questionScore = 0
      }
    }
    var result = {
      eval: correctAnswer,
      state: {
        val: {
          "seq_rearranged": seq_rearranged,
          "seq_rendered": instance._question.data.options
        }
      },
      score: questionScore,
      max_score: this._question.config.max_score,
      values: telemetryValues,
      noOfCorrectAns: correctAnswersCount,
      totalAns: totalOptions
    };
    if (_.isFunction(callback)) {
      callback(result);
    }
  },
  logTelemetryItemResponse: function (data) {
    QSTelemetryLogger.logEvent(QSTelemetryLogger.EVENT_TYPES.RESPONSE, {
      "type": "INPUT",
      "values": data
    });
  },
  /**
   * shuffles the options array
   */
  shuffleOptions: function (options) {
    var shuffled = [];
    var selected = this.derange(_.range(0, options.length));
    _.each(selected, function (i) {
      shuffled.push(options[i]);
    });
    return shuffled;
  },
  /**
   * deranges (shuffles such that no element will remain in its original index) 
   * the elements the given array. This is a JavaScript implementation of
   * Sattolo's algorithm [https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#Sattolo's_algorithm]
   */
  derange: function (array) {
    var m = array.length, t, i;
    _.each(_.range(0, m - 1), function (i, k) {
      var j = _.random(i + 1, m - 1); // note: i+1
      t = array[i];
      array[i] = array[j];
      array[j] = t;
    });
    return array;
  }
});
//# sourceURL=questionunit.sequence.renderer.plugin.js