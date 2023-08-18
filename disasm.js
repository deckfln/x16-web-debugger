function snprintf(value, format) 
{
	let i = 0;
	let in_format = false;
	let str_before = "";
	let start = 0
	let print = ""
	for (; i < format.length; i++) {
		if (in_format) {
			if (format[i] == "X") {
				let len = parseInt(format.substring(start, i));
				let zeros = "000000";
				v = ("000000" + value.toString(16)).slice(-len);
				in_format = false;
				print += v;
			}
			else if (format[i] == "s") {
				in_format = false;
				print += value;
			}
		}
		else if (format[i] == "%") {
			in_format = true;
			start = i+1
		}
		else {
			print += format[i];
		}
	}
	return print;
}

// ported from https://github.com/indigodarkwolf/box16/blob/master/src/overlay/disasm_overlay.cpp
function disasm_label(target, bank, branch_target, format)
{
	let r = snprintf(target, format);
    return r;
}


function disasm_label_wrap(target, bank, branch_target, hex_format, wrapper_format)
{
    let inner = snprintf(target, hex_format);
	let wrapped = snprintf(inner, wrapper_format);
    return wrapped;
}

function disam_line(memory, asm, bank) 
{
    let opcode   = memory[asm.pc];
    let mnemonic = mnemonics[opcode];

	//		Test bbr and bbs, the "zero-page, relative" ops. These all count as branch ops.
	//		$0F,$1F,$2F,$3F,$4F,$5F,$6F,$7F,$8F,$9F,$AF,$BF,$CF,$DF,$EF,$FF
	//
	const is_zprel = (opcode & 0x0F) == 0x0F;
	const is_jump = mnemonic == "jmp";

	//		Test for branches. These are BRA ($80) and
	//		$10,$30,$50,$70,$90,$B0,$D0,$F0.
	//		All 'jmp' ops count as well.
	//
	const is_branch = is_zprel || is_jump || ((opcode == 0x80) || ((opcode & 0x1F) == 0x10) || (opcode == 0x20));

	const mode = mnemonics_mode[opcode];

	switch (mode) {
		case op_mode.MODE_ZPREL: {
            let zp     = memory[asm.pc + 1];
            let target = asm.start + asm.pc + 3 + memory[asm.pc + 2];

            console.write(mnemonic);

            let r = disasm_label(zp, bank, false, "$%02X");
            let r1 = disasm_label(target, bank, is_branch, "$%04X");
			asm.txt = mnemonic+" "+r+","+r1;
			asm.next = asm.pc + 3;
            break; 
        }
        case op_mode.MODE_IMP:
            asm.txt = mnemonic;
			asm.next = asm.pc + 1;
            break;
        case op_mode.MODE_IMM: {
            let value = memory[asm.pc + 1];

            asm.txt = mnemonic + " #" + value;
			asm.next = asm.pc + 2;
            break;
        } 
		case op_mode.MODE_ZP: {
			let value = memory[asm.pc + 1];

			let r = disasm_label(value, bank, is_branch, "$%02X");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 2;
            break;            
		}        
		case op_mode.MODE_REL: {
			let rel = memory[asm.pc + 1];
			if (rel > 127) {
				rel = rel-256;
			}
			let target = asm.start + asm.pc + 2 + rel;

			let r = disasm_label(target, bank, is_branch, "$%04X");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 2;
            break;
		}
		case op_mode.MODE_ZPX: {
			let value = memory[asm.pc + 1];

			let r = disasm_label_wrap(value, bank, is_branch, "$%02X", "%s,x");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 2;
            break;
		}        
		case op_mode.MODE_ZPY: {
			let value = memory[asm.pc + 1];

			let r = disasm_label_wrap(value, bank, is_branch, "$%02X", "%s,y");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 2;
            break;
		}
		case op_mode.MODE_ABSO: {
			let target = memory[asm.pc + 1] | memory[asm.pc + 2] << 8;

			let r = disasm_label(target, bank, is_branch, "$%04X");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 3;
            break;
		}
		case op_mode.MODE_ABSX: {
			let target = memory[asm.pc + 1] | memory[asm.pc + 2] << 8;

			let r = disasm_label_wrap(target, bank, is_branch, "$%04X", "%s,x");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 3;
            break;
		}
		case op_mode.MODE_ABSY: {
			let target = memory[asm.pc + 1] | memory[asm.pc + 2] << 8;

			let r = disasm_label_wrap(target, bank, is_branch, "$%04X", "%s,y");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 3;
            break;
		}        
		case op_mode.MODE_AINX: {
			let target = memory[asm.pc + 1] | memory[asm.pc + 2] << 8;

			let r = disasm_label_wrap(target, bank, is_branch, "$%04X", "(%s,x)");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 3;
            break;  
		}      
		case op_mode.MODE_INDY: {
			let target = memory[asm.pc + 1];

			let r = disasm_label_wrap(target, bank, is_branch, "$%02X", "(%s),y");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 2;
            break;
		}        
        case op_mode.MODE_INDX: {
			let target = memory[asm.pc + 1];

            let r = disasm_label_wrap(target, bank, is_branch, "$%02X", "(%s,x)");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 2;
            break;
		}
		case op_mode.MODE_IND: {
			let target = memory[asm.pc + 1] | memory[asm.pc + 2] << 8;

			let r = disasm_label_wrap(target, bank, is_branch, "$%04X", "(%s)");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 3;
            break;
		}        
		case op_mode.MODE_IND0: {
			let target = memory[asm.pc + 1];

			let r = disasm_label_wrap(target, bank, is_branch, "$%02X", "(%s)");
            asm.txt = mnemonic+" "+r;
			asm.next = asm.pc + 2;
            break;
		}
		case op_mode.MODE_A:
            asm.txt = mnemonic+" a";
			asm.next = asm.pc + 1;
			break;        
    }
}