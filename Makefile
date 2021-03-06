JSCOVERAGE = ./node_modules/visionmedia-jscoverage/jscoverage

test:
	@npm install
	@node ./build/makeconf.js
	@./node_modules/mocha/bin/mocha --reporter spec --timeout 6000 test/unit/*.js

cov:
	@npm install
	@node ./build/makeconf.js
	-mv app app.bak && $(JSCOVERAGE) app.bak app 
	-./node_modules/mocha/bin/mocha --reporter html-cov --timeout 6000 --ignore-leaks test/unit/*.js > ./coverage.html
	-rm -rf app && mv app.bak app

func:
	@npm install
	@node ./build/makeconf.js
	./bin/iservice restart
	@-./node_modules/mocha/bin/mocha --reporter spec --timeout 6000 test/func/*.js
	./bin/iservice stop

clean:
	@rm -rf ./run/svn/*

.PHONY: test
