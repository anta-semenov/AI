//
//  ViewController.swift
//  AI
//
//  Created by Anton on 30/10/2017.
//  Copyright © 2017 Anton Semenov. All rights reserved.
//

import Cocoa

class ViewController: NSViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }

    override var representedObject: Any? {
        didSet {
        // Update the view, if already loaded.
        }
    }

    @IBAction func prepareDataSet(_ sender: NSButton) {
        convertData()
    }
    
}

