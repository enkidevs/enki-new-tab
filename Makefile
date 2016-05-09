include node_modules/@mathieudutour/js-fatigue/Makefile

less:
	echo "  $(P) Compiling Less"
	$(BIN_DIR)/lessc src/styles/index.less build/style.css
