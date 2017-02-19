#! /usr/bin/env python
# -*- coding: iso-8859-1 -*-

a = [6, 9, 10, 11, 12, 28]

def div(l):
	"""Función que determina si un número es perfecto, abundante, o defectivo."""

	for n in l:
		print "Calculando divisores propios positivos de", n, "..."
		print "    Divisores propios:",
		total, x = 0, 1
		while x < n:
			if n % x == 0:
				print x,
				total = total + x
			x = x + 1

		print 

		if total == n:
			print "   ",n, "es un número perfecto"
		elif total < n:
			print "   ",n, "es un número defectivo"
		else:
			print "   ",n, "es un número abundante"			

		print
				

div(a)
